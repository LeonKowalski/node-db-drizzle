// Copyright 2011 Mariano Iglesias <mgiglesias@gmail.com>
#include "./connection.h"

node_db_drizzle::Connection::Connection()
    :mysql(true),
    drizzle(NULL),
    connection(NULL) {
    this->port = 3306;
}

node_db_drizzle::Connection::~Connection() {
    this->close();
    if (this->drizzle != NULL) {
        drizzle_free(this->drizzle);
    }
}

bool node_db_drizzle::Connection::isMysql() const {
    return this->mysql;
}

void node_db_drizzle::Connection::setMysql(bool mysql) {
    this->mysql = mysql;
}

bool node_db_drizzle::Connection::isAlive(bool ping) throw() {
    if (ping && this->alive) {
        drizzle_return_t executed;
        drizzle_result_st* result = drizzle_con_ping(this->connection, NULL, &executed);
        if (result != NULL) {
            drizzle_result_free(result);
        }

        this->alive = (executed == DRIZZLE_RETURN_OK);
    }
    return this->alive;
}

void node_db_drizzle::Connection::open() throw(node_db::Exception&) {
    this->close();

    if (this->drizzle == NULL) {
        this->drizzle = drizzle_create(NULL);
        if (this->drizzle == NULL) {
            throw node_db::Exception("Cannot create drizzle structure");
        }
    }

    this->connection = drizzle_con_create(this->drizzle, NULL);
    if (this->connection == NULL) {
        throw node_db::Exception("Cannot create connection structure");
    }

    drizzle_con_set_tcp(this->connection, this->hostname.c_str(), this->port);
    drizzle_con_set_auth(this->connection, this->user.c_str(), this->password.c_str());
    drizzle_con_set_db(this->connection, this->database.c_str());
    if (this->mysql) {
        drizzle_con_add_options(this->connection, DRIZZLE_CON_MYSQL);
    }

    if (drizzle_con_connect(this->connection) == DRIZZLE_RETURN_OK) {
        this->alive = true;
    } else {
        const char* error = drizzle_con_error(this->connection);
        drizzle_con_free(this->connection);
        this->alive = false;
        this->connection = NULL;

        throw node_db::Exception(error);
    }
}

void node_db_drizzle::Connection::close() {
    if (this->connection != NULL) {
        drizzle_con_close(this->connection);
        drizzle_con_free(this->connection);
        this->connection = NULL;
    }
    this->alive = false;
}

std::string node_db_drizzle::Connection::escape(const std::string& string) const throw(node_db::Exception&) {
    char* buffer = new char[string.length() * 2 + 1];
    if (buffer == NULL) {
        throw node_db::Exception("Can\'t create buffer to escape string");
    }

    drizzle_escape_string(buffer, string.c_str(), string.length());

    std::string escaped = buffer;
    delete [] buffer;
    return escaped;
}

std::string node_db_drizzle::Connection::version() const {
    std::string version = drizzle_con_server_version(this->connection);
    return version;
}

node_db::Result* node_db_drizzle::Connection::query(const std::string& query) const throw(node_db::Exception&) {
    drizzle_result_st *result = NULL;
    drizzle_return_t executed;
    try {
        result = drizzle_query(this->connection, NULL, query.c_str(), query.length(), &executed);
        if (executed != DRIZZLE_RETURN_OK) {
            throw node_db::Exception(drizzle_con_error(this->connection));
        }
    } catch(...) {
        if (result != NULL) {
            drizzle_result_free(result);
        }
        throw;
    }

    if (result == NULL) {
        throw node_db::Exception("Could not fetch result of query");
    }

    return new node_db_drizzle::Result(this->drizzle, result);
}
