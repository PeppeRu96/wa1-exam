'use strict';
/* Data Access Object (DAO) module for accessing administrators and managing password matching through hashing */

const db = require('./db');
const bcrypt = require('bcrypt');
const errors = require('../error-handler').errors;

/**
 * 
 * @param {*} id the administrator id we want to retrieve
 * @returns a Promise containing the admin object {id, username} (if successful) or a custom error (if not successful)
 */
exports.getAdminById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM administrator WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                reject(errors.AdminNotFoundById);
            else {
                // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
                const admin = { id: row.id, username: row.username }
                resolve(admin);
            }
        });
    });
};

/**
 * 
 * @param {*} username 
 * @param {*} password 
 * @returns a Promise containing the admin object {id, username} (if login successful) or a custom error (if not successful)
 */
exports.loginAdmin = (username, password) => {
    const sql = 'SELECT * FROM administrator WHERE username = ?';

    return new Promise((resolve, reject) => {
        db.get(sql, [username], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined) {
                reject(errors.LoginFailed);
            }
            else {
                const admin = { id: row.id, username: row.username };

                // check the hashes with an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
                bcrypt.compare(password, row.password).then(result => {
                    if (result)
                        resolve(admin);
                    else
                        reject(errors.LoginFailed);
                });
            }
        });
    });
};