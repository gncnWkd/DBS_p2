DROP DATABASE IF EXISTS DB_2020014975;
CREATE DATABASE DB_2020014975;
USE DB_2020014975;

CREATE TABLE User(
	UserID varchar(12),
	Password varchar(20),
	Name char(10),
	Balance int,
	PRIMARY KEY (UserID)
	);

CREATE TABLE Stock(
	StockName varchar(20),
	CurrentPrice int,
	PreviousClosingPrice int,
	PRIMARY KEY (StockName)
	);
	
CREATE TABLE Holding(
	UserID varchar(12),
	StockName varchar(20),
	Quantity int,
	FOREIGN KEY (UserID) REFERENCES User (UserID),
	FOREIGN KEY (StockName) REFERENCES Stock (StockName),
	PRIMARY KEY (UserID, StockName)
	);

CREATE TABLE Transaction(
	TransactionID int,
	UserID varchar(12),
	StockName varchar(20),
	Type ENUM('Buy', 'Sell'),
	Amount int,
	Price int,
	Date date,
	Time time,
	PRIMARY KEY (TransactionID),
	FOREIGN KEY (UserID) REFERENCES User (UserID),
	FOREIGN KEY (StockName) REFERENCES Stock (StockName)
	);

CREATE TABLE BidOffer(
	BidOfferID int,
	UserID varchar(12),
	StockName varchar(20),
	Type ENUM('Buy', 'Sell'),
	Amount int,
	Price int,
	PRIMARY KEY (BidOfferID),
	FOREIGN KEY (UserID) REFERENCES User (UserID),
	FOREIGN KEY (StockName) REFERENCES Stock (StockName)
	);