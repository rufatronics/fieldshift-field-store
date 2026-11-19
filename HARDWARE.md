# Field + Store hardware plan

This repository contains a simulator and a build proposal. It does not claim that physical hardware has been assembled or tested.

## Deployment shape

The practical first unit is one shared field node per cooperative plot or extension worker, plus one store node inside a grain store. A shared node is more realistic than one expensive device per farmer. Local Bluetooth or Wi-Fi keeps the first demonstration useful without a cloud account.

## Field node

Suggested parts: ESP32 board, capacitive soil-moisture probe, BME280 or equivalent air temperature/relative humidity sensor, waterproof soil-temperature probe, optional tipping-bucket rain gauge, optional water-level sensor, solar panel, charge controller, Li-ion battery, fuse, weather-resistant enclosure, cable glands, and mounting stake.

Place the moisture probe in a representative root-zone location and keep the BME280 shaded and ventilated. The enclosure should resist dust, heat, rain, and theft. Water level should be mounted where it cannot be mistaken for a field-wide measurement. Each installation needs local soil calibration and a written placement note.

## Store node

Suggested parts: ESP32 or low-power equivalent, temperature/relative humidity sensor, battery measurement circuit, battery, ventilated protective enclosure, and optional GSM/SMS module. Place the sensor inside the grain store away from direct sun, wet walls, and the air outlet. A single point does not represent every sack or bag.

## Wiring sketch

For a typical ESP32 proof of concept: power the BME280 from 3.3V/GND and use I2C SDA/SCL; power the capacitive probe from a filtered ADC supply and connect its analogue output to a protected ADC pin; connect a water-level analogue/digital output through the board's allowed voltage range; measure battery through a resistor divider sized for the ADC. Add common ground, strain relief, a fuse, and a sealed connector. Confirm each board's pin map before energising; this is a planning note, not a production wiring guarantee.

## Costs and safety

Price, availability, and local sourcing should be checked before procurement. Do not expose a battery, mains supply, or GSM antenna in a farmer-accessible enclosure. Use a fuse, protected charging, strain relief, and a weatherproof box. Keep the sensor cable away from sharp edges and livestock access.

## Calibration and operating limits

Sensors supply measurements; they do not make agronomic recommendations. Moisture readings depend on soil texture, probe placement, salinity, temperature, and calibration. A water sensor measures one location. The dashboard marks current readings as uncalibrated in the simulator. Before a pilot, log reference samples, compare sensor values against hand measurements, set site-specific thresholds, and document maintenance intervals.

Physical parts not tested in this repository: ESP32 firmware, BLE pairing, Wi-Fi ingestion, rain gauge, water-level electronics, battery charging, enclosure durability, GSM/SMS, and sensor calibration under field conditions.
