# Pomucky

# Pomucky

## Arduino
- https://github.com/mcci-catena/arduino-lmic
  - v examples je ttn-abp
  - secret.h má všechny klíče
    - klíče jsou z ttn kde se zařízení musí zaregristovat

- https://www.thethingsnetwork.org/
  - klíče zde pozor na způsob aktivace musí být abp a dát do secret.h
- https://how2electronics.com/otaa-based-lorawan-node-with-arduino-lora-sx1276/
  - guide asi nejlepší, je tam video, pinout a jak se to má zapojit
  - taky mac verze pro ttn a freq
  - vynechat payload formater
- https://portal.iot.cra.cz/dashboard/
  - zde se musí registrovat zařízení pomocí klíčů z ttn
  - secret.h zapsat klíče v consolu se to dá i naformátovat

- https://randomnerdtutorials.com/complete-guide-for-ultrasonic-sensor-hc-sr04/
  - popis newping library a jak to sestavit s arduinem

- pro debug odkomentovat všechny komentáře s Serial.print a Serial.println
- jsou tam nastavené i piny na wifi ale není tam knihovna
- BAUD se muže měnit mezi 9600 a 115200
- TX_INTERVAL ještě otestovat jak moc velký musí být pro funkčnost
- MaxVdálenost se taky může trošku poměnit aby to bylo spolehlivější

## database a api routy
- postgres
  - v .env se nastaví user, password, host, port, databáze a schéma (většinou public)
- nextjs api routes
  - methody GET a POST
  - GET vybere z DB jen id a status
  - POST vloží status tam kde je stejné EUI
- db
  - musí se tam vložit id př. "a1"
  - a musí se tam taky vložit EUI z ttn

## Arduino V2
- Na každém parkovacím místě bude jednotka Arduino Nano s LoRa modulem a senzorem vzdálenosti
- Stanice vysílá svůj stav další a systém se řetězí až k centrální stanici(Arduino uno s WiFi nebo   gsm modulem)
  - Tutoriál na gsm modul z obchodu dratek.cz
    - https://navody.dratek.cz/navody-k-produktum/gsm-shield-sim900-gprs-a-thingspeak.html
- Pinout
  - Nano
    - LoRa-- NSS-10, RST-9, DIO0-2, Senzor-- Trig-4,Echo-5,VCC-5V,GND-GND
- LoRa stanice si přeposílají JSON, který je uložený v projektech jako proměnná jsonData
- Pro provoz programů jsou potřeba knihovny LoRa, WiFiNINA a NewPing
- Program pro Uno moduly se senzorem je funkční, pouze je třeba vložit kód senzoru z projektu WifiParkingStation
- Je možné že v programu centrální stanice bude třeba vyladit příjem většího počtu packetů
