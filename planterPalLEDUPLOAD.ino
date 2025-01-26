#include <WiFiNINA.h>
#include <MMA7660.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "";       // Replace w your WiFi SSID
const char* password = ""; // Replace w your WiFi pass

// Server details
const char* server = "";  // Replace with your PC's IP address
const int port = 5000;

// Grove Buzzer Pin (now used for the LED)
const int buzzerPin = 4; // Pin connected to the Grove LED

MMA7660 accelerometer;
WiFiClient client;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  // Connect to WiFi
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  accelerometer.init();

  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
}

void loop() {
  int8_t x, y, z;
  accelerometer.getXYZ(&x, &y, &z);

  String data;
  StaticJsonDocument<200> doc;
  doc["X"] = x;
  doc["Y"] = y;
  doc["Z"] = z;
  serializeJson(doc, data);

  if (client.connect(server, port)) {
    client.println("POST /data HTTP/1.1");
    client.println("Host: " + String(server));
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(data.length());
    client.println();
    client.println(data);

    Serial.println("Data sent: " + data);

    bool isBody = false;
    String response = "";

    while (client.connected() || client.available()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") {
        isBody = true;  // End of headers, start of body
      } else if (isBody) {
        response += line;  // Append body content
      }
    }

    Serial.println("Raw JSON body: " + response);

    StaticJsonDocument<200> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (!error) {
      String action = responseDoc["action"];
      Serial.println("Server response: " + action);

      if (action == "buzz") {  // Reuse "buzz" action for LED
        digitalWrite(buzzerPin, HIGH);  // Turn on LED
        // Serial.print(x);
        // Serial.print(" ");
        // Serial.print(y);
        // Serial.print(" ");
        // Serial.println(z);
        delay(250);  // Keep LED on for 1 second
        digitalWrite(buzzerPin, LOW);  // Turn off LED
      }
    } else {
      Serial.println("Failed to parse JSON response.");
      Serial.println("DeserializationError: " + String(error.c_str()));
    }
    client.stop();
  } else {
    Serial.println("Connection to server failed.");
  }

  delay(250);  
}
