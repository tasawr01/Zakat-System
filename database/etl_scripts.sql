-- ============================================================
-- ETL SCRIPTS - DATA IMPORT STRATEGY
-- ============================================================

-- 1. PREPARATION
-- Ensure the directory object exists in Oracle
-- CREATE OR REPLACE DIRECTORY CSV_DIR AS 'C:\oracle\uploads';
-- GRANT READ, WRITE ON DIRECTORY CSV_DIR TO charity_admin;

-- 2. EXTERNAL TABLE DEFINITION (For Donors)
-- This allows querying the CSV file directly as if it were a table
-- ------------------------------------------------------------
CREATE TABLE EXT_DONORS_IMPORT (
    USERNAME      VARCHAR2(50),
    EMAIL         VARCHAR2(100),
    PHONE         VARCHAR2(20),
    ROLE          VARCHAR2(20)
)
ORGANIZATION EXTERNAL (
    TYPE ORACLE_LOADER
    DEFAULT DIRECTORY CSV_DIR
    ACCESS PARAMETERS (
        RECORDS DELIMITED BY NEWLINE
        FIELDS TERMINATED BY ','
        MISSING FIELD VALUES ARE NULL
        (
            USERNAME      CHAR(50),
            EMAIL         CHAR(100),
            PHONE         CHAR(20),
            ROLE          CHAR(20)
        )
    )
    LOCATION ('donors_data.csv')
)
REJECT LIMIT UNLIMITED;

-- 3. MERGE STATEMENT (ETL Process)
-- Load data from External Table into actual USERS tables
-- ------------------------------------------------------------
MERGE INTO USERS_PUBLIC p
USING EXT_DONORS_IMPORT e
ON (p.EMAIL = e.EMAIL)
WHEN MATCHED THEN
    UPDATE SET p.USERNAME = e.USERNAME
WHEN NOT MATCHED THEN
    INSERT (USERNAME, EMAIL, ROLE)
    VALUES (e.USERNAME, e.EMAIL, e.ROLE);

-- Note: For USERS_SECURE, we would need to handle password generation and PII insertion separately
-- potentially using a PL/SQL procedure to split the data.

-- 4. SQL*LOADER CONTROL FILE (Alternative Method)
-- Save this as 'load_donations.ctl'
-- ------------------------------------------------------------
/*
LOAD DATA
INFILE 'donations_data.csv'
INTO TABLE DONATIONS
FIELDS TERMINATED BY "," OPTIONALLY ENCLOSED BY '"'
(
    DONOR_ID      INTEGER EXTERNAL,
    AMOUNT        DECIMAL EXTERNAL,
    CURRENCY      CHAR(3),
    DONATION_TYPE CHAR(20),
    DONATION_DATE DATE "DD-MM-YYYY",
    STATUS        CONSTANT "PENDING"
)
*/
