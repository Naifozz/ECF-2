CREATE TABLE IF NOT EXISTS `USER` (
  `ID_User` integer PRIMARY KEY autoincrement,
  `Pseudo` varchar(255),
  `Email` varchar(255),
  `Password` varchar(255)
);

CREATE TABLE IF NOT EXISTS `INVENTORY` (
  `ID_Inventory` integer PRIMARY KEY autoincrement,
  `ID_User` integer,
  FOREIGN KEY (`ID_User`) REFERENCES `USER` (`ID_User`)
);

CREATE TABLE IF NOT EXISTS `ITEM` (
  `ID_Item` integer PRIMARY KEY autoincrement,
  `Name` varchar(255)
);

CREATE TABLE IF NOT EXISTS `ITEM_INV` (
  `ID_Inventory` integer,
  `ID_Item` integer,
  `Quantity` integer,
  PRIMARY KEY (`ID_Inventory`, `ID_Item`),
  FOREIGN KEY (`ID_Inventory`) REFERENCES `INVENTORY` (`ID_Inventory`),
  FOREIGN KEY (`ID_Item`) REFERENCES `ITEM` (`ID_Item`)
);

CREATE TABLE IF NOT EXISTS `RECIPE` (
  `ID_Recipe` integer PRIMARY KEY autoincrement,
  `ID_Item_Result` integer,
  FOREIGN KEY (`ID_Item_Result`) REFERENCES `ITEM` (`ID_Item`)
);

CREATE TABLE IF NOT EXISTS `ITEM_RECIPE` (
  `ID_Recipe` integer,
  `ID_Item` integer,
  `position_x` integer,
  `position_y` integer,
  PRIMARY KEY (`ID_Recipe`, `ID_Item`),
  FOREIGN KEY (`ID_Recipe`) REFERENCES `RECIPE` (`ID_Recipe`),
  FOREIGN KEY (`ID_Item`) REFERENCES `ITEM` (`ID_Item`)
);