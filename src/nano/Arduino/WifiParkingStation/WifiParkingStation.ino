#include <SPI.h>
#include <WiFiNINA.h>
#include <NewPing.h>

#define TRIGGER_PIN 4
#define ECHO_PIN 5
#define MAX_DISTANCE 500
#define EUI "70B3D57ED005D795"
#define PASSWORD "test"
// Replace with your network credentials
char ssid[] = "ITIXO Public";
char pass[] = "ITIXOTower!";
char server[] = "192.168.26.128";
int port = 3000;
int status = WL_IDLE_STATUS;

int pTrig = 4;
int pEcho = 5;  
long response, distance;

WiFiClient client;

NewPing sonar(TRIGGER_PIN,ECHO_PIN,MAX_DISTANCE);

void setup() {

  pinMode(pTrig,OUTPUT);
  pinMode(pEcho,INPUT);
 
  WiFiDrv::pinMode(25, OUTPUT); //define GREEN LED
  WiFiDrv::pinMode(26, OUTPUT); //define RED LED
  WiFiDrv::pinMode(27, OUTPUT); //define BLUE LED
  WiFi.lowPowerMode();
  Serial.begin(9600);

  // Check for the WiFi module
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    while (true);
  }

  // Attempt to connect to Wi-Fi network
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);

    // Wait 10 seconds for connection
    delay(10000);
  }

  // Once connected
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
}

void loop() {
  
int sensorValue = 2;

 // digitalWrite(pTrig, LOW);
 //delayMicroseconds(2);
  //digitalWrite(pTrig, HIGH);
  //delayMicroseconds(5);
  //digitalWrite(pTrig, LOW);
  
  //response = pulseIn(pEcho, HIGH);
  //distance = response / 58.31;


  distance = sonar.ping_cm();
  Serial.print("Vzdalenost je ");
  Serial.print(distance);
  Serial.println("cm.");
  //Serial.println(response);

if(distance >= 20){
  sensorValue = 1;
  WiFiDrv::analogWrite(25, 255); //GREEN
  WiFiDrv::analogWrite(26, 0);   //RED
  WiFiDrv::analogWrite(27, 0);   //BLUE
}
else{
  sensorValue = 2;
  WiFiDrv::analogWrite(25, 0); //GREEN
  WiFiDrv::analogWrite(26, 255);   //RED
  WiFiDrv::analogWrite(27, 0);   //BLUE
}

  sendData(sensorValue);

  delay(5000);
}

void sendData(int value) {
  if (client.connect(server, port)) {
    Serial.println("Connected to server");

    // Create a JSON string
   String jsonData = "{\"data\":" + String(value) + ", \"EUI\":\"" + EUI + "\", \"password\":\"" + PASSWORD + "\"}";

    // Send HTTP POST request
    client.println("POST /api/parking HTTP/1.1");
    client.println("Host: 192.168.26.128"); // Replace with the IP address of the target device
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(jsonData.length());
    client.println();
    client.println(jsonData);

    // Wait for server response
    while (client.connected()) {
      if (client.available()) {
        String response = client.readString();
        Serial.println(response);
        break;
      }
    }

    // Close the connection
    client.stop();
  } else {
    Serial.println("Connection to server failed");
  }
}
