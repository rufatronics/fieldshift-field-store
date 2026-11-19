# Field node wiring notes

Use 3.3V/GND and I2C SDA/SCL for a BME280-class sensor. Feed a capacitive probe through a protected ADC input and use a filtered supply. Connect a water-level sensor only within the board's allowed voltage range. Add common ground, a fuse, strain relief, and sealed cable glands. Confirm the exact ESP32 pin map and sensor datasheet before energising. This is a design note, not tested wiring.
