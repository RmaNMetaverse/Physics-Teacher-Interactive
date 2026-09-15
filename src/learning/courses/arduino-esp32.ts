import { source, starterCourse } from './shared';

const references = [
  source('Arduino built-in examples', 'https://docs.arduino.cc/built-in-examples/'),
  source('Arduino language reference', 'https://docs.arduino.cc/language-reference/'),
  source('ESP32 GPIO programming guide', 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/peripherals/gpio.html'),
  source('ESP32 series datasheet', 'https://documentation.espressif.com/esp32_datasheet_en.html'),
];

export const arduinoEsp32Course = starterCourse({
  id: 'arduino-esp32', title: 'Arduino & ESP32 beginner lab', group: 'classical', color: '#6fc6b3', model: 'microcontroller', reviewedAt: '2026-09-15',
  description: 'Start with board pins, Blink, buttons, PWM LEDs and analog sensors in a guided virtual workbench.',
  sources: references,
  limitations: ['The board lab runs four predefined behaviors, not arbitrary Arduino or ESP-IDF code. The pictured pinout is representative and must not be used as a wiring authority for a specific board; no USB flashing or network stack is modeled.'],
  missions: [
    {
      id: 'board-and-safe-wiring', title: 'Boards, pins and safe wiring', summary: 'A board provides power, ground, digital pins and sometimes analog inputs.',
      body: ['A microcontroller board runs a program that reads inputs and drives outputs. Ground is the shared electrical reference. For a first LED circuit, put the LED and a current-limiting resistor between an output and ground, in the correct polarity.', 'A classic Arduino UNO R3 uses 5 V logic, while the original ESP32 chip uses 3.3 V logic. Do not connect a 5 V output directly to an ESP32 input. Actual board pin availability, current limits and boot-sensitive pins vary; consult the specific board documentation before wiring hardware.'],
      equation: 'I_\\mathrm{LED}\\approx\\frac{V_\\mathrm{pin}-V_\\mathrm{LED}}{R}', symbols: [['I_LED', 'estimated LED current, A'], ['V_pin', 'pin-high voltage, V'], ['V_LED', 'assumed LED drop, V'], ['R', 'series resistor, Ω']], math: 'algebra', mathNotes: ['Subtract the approximate LED drop and divide by the resistor; a logic output is not a power supply for arbitrary loads.'],
      example: { question: 'Estimate LED current from a 3.3 V pin, 2 V LED and 330 Ω resistor.', steps: ['Remaining resistor voltage is 3.3−2=1.3 V.', 'Divide 1.3 V by 330 Ω.'], answer: 'About 0.0039 A = 3.9 mA.' },
      calculation: ['Estimate current from a 5 V output, 2 V LED and 300 Ω resistor.', .01, 'A', 'The resistor takes the remaining 3 V, so I=(5−2)/300=0.01 A.'],
      predict: ['Is a 5 V UNO output a safe direct input to an original 3.3 V ESP32?', ['No', 'Yes'], 0, 'Use suitable level shifting and consult actual board ratings.'],
      check: ['Why does a first LED wiring example include a resistor?', ['To limit current', 'To make the ground node disappear'], 0, 'The series resistance limits estimated current.'],
      lab: 'Choose Arduino UNO R3 and then original ESP32 in the virtual board workbench. Compare nominal logic voltage and estimated LED current with the same resistor. The illustrated board connections are teaching diagrams, not an exact production pinout.',
      preset: { mode: 0, board: 0, resistance: 330 }, takeaway: 'Share ground, limit LED current and respect each board’s logic voltage.', limitation: 'Actual GPIO drive strength, protective resistors, pin mapping and board revisions are not modeled.'
    },
    {
      id: 'blink-sketch', title: 'Blink: output and timing', summary: 'A digital output can repeat high and low states over time.',
      body: ['The familiar Blink example configures a pin as OUTPUT in setup(), then alternates HIGH and LOW in loop(). A delay gives each state a duration, but blocking delays prevent other work until they finish.', 'The virtual Blink preset uses an equal on/off fraction of a chosen period. Reading the waveform and LED visualization lets you separate the pin’s logic level from the average LED current. Real code is shown as guidance but is not parsed or executed by this lab.'],
      equation: 'f=\\frac{1}{T}', symbols: [['f', 'blink cycles per second, Hz'], ['T', 'full on/off period, s']], math: 'ratios', mathNotes: ['One complete on-and-off cycle takes T seconds; frequency is the reciprocal.'],
      example: { question: 'A LED completes an on/off cycle every 2 s. Find frequency.', steps: ['One cycle takes 2 s.', 'Compute 1/2 s.'], answer: '0.5 Hz.' },
      calculation: ['A Blink pattern repeats every 4 s. Find its frequency.', .25, 'Hz', 'One complete cycle takes 4 s, so f=1/4=0.25 Hz.'],
      predict: ['For an equal on/off Blink cycle, what is its on-time fraction?', ['50%', '100%'], 0, 'Half of the period is high and half is low.'],
      check: ['Does changing the period change the fraction of time the preset LED is on?', ['No', 'Yes'], 0, 'The preset keeps an equal on/off split.'],
      lab: 'Choose the Blink example. Pause and step time to inspect HIGH and LOW, then vary its period. Compare the UNO and ESP32 nominal logic voltages. The sample sketch illustrates setup()/loop() but the simulator evaluates a fixed timing rule.',
      preset: { mode: 0, period: 2 }, takeaway: 'Trace one full Blink period before calculating its frequency.', limitation: 'Real schedulers, instruction timing, startup behavior and any compiled firmware are absent.'
    },
    {
      id: 'button-input', title: 'Buttons and digital input', summary: 'A button needs a defined resting logic level.',
      body: ['A disconnected input can float because it has no reliable high or low voltage. A pull-down makes unpressed LOW; a pull-up makes unpressed HIGH, so the wiring and software interpretation must agree.', 'The lab’s button preset is a simple active-high pulled input. Pressing the virtual button raises the read level and turns on the representative LED. Real mechanical contacts can bounce, requiring debounce in hardware or code.'],
      equation: 'x=\\begin{cases}1&\\text{pressed}\\\\0&\\text{released}\\end{cases}', symbols: [['x', 'digital input state'], ['1', 'HIGH in this active-high example'], ['0', 'LOW in this active-high example']], math: 'functions', mathNotes: ['A digital input is a discrete state; its meaning depends on pull-up or pull-down wiring.'],
      example: { question: 'A pulled-down input is sampled three times: released, pressed, released.', steps: ['Released maps to 0.', 'Pressed maps to 1; the final release maps back to 0.'], answer: 'The states are 0, 1, 0.' },
      calculation: ['With a 5 V active-high input, what voltage represents HIGH in this ideal example?', 5, 'V', 'The ideal HIGH state uses the board’s nominal 5 V logic level.'],
      predict: ['Why include a pull resistor for an unpressed mechanical button?', ['To define the resting level', 'To force an undefined level'], 0, 'The resistor gives an unpressed input a reference voltage.'],
      check: ['In this active-high lab, a released button reads?', ['LOW', 'HIGH'], 0, 'The preset represents a pulled-down input.'],
      lab: 'Select Button input and press or release the virtual control. Observe the input state, output LED and highlighted wire path. This template deliberately uses active-high logic and does not simulate contact bounce.',
      preset: { mode: 1, buttonPressed: 0 }, takeaway: 'State the pull configuration before interpreting a button read.', limitation: 'Input leakage, threshold variation and button debounce are outside the ideal digital preset.'
    },
    {
      id: 'pwm-output', title: 'PWM and LED dimming', summary: 'Pulse-width modulation changes the fraction of time a digital pin is HIGH.',
      body: ['PWM rapidly alternates HIGH and LOW. Duty cycle is high time divided by the full period. A larger duty cycle usually appears brighter on an LED, but it is still pulses rather than a true analog voltage.', 'The virtual preset fixes a representative 50 Hz pulse period to make the waveform easy to inspect. Actual PWM frequency, output polarity and API depend on board and peripheral configuration, especially on ESP32. Average current is only an ideal estimate.'],
      equation: 'D=\\frac{t_\\mathrm{HIGH}}{T}', symbols: [['D', 'duty fraction'], ['t_HIGH', 'high time, s'], ['T', 'full PWM period, s']], math: 'ratios', mathNotes: ['Express percentage as a fraction before multiplying it by the period or the estimated high-state current.'],
      example: { question: 'A 20 ms period has 5 ms HIGH. Find duty cycle.', steps: ['Divide 5 ms by 20 ms.', 'Convert 0.25 to a percentage.'], answer: '25%.' },
      calculation: ['A 20 ms period is HIGH for 10 ms. Find duty percentage.', 50, '%', 'Divide high time by the full period: 10/20=0.5=50%.'],
      predict: ['Does PWM at 25% duty create a constant analog 25%-of-supply voltage at the digital pin?', ['No', 'Yes'], 0, 'The pin alternates between logic levels.'],
      check: ['At 0% duty, the ideal high-state time is?', ['Zero', 'The whole period'], 0, 'A zero duty fraction has no high portion.'],
      lab: 'Choose PWM dimming. Vary duty from 0% to 100%, pause and inspect the pulse waveform and virtual LED. Compare average current; consult board documentation before choosing a real PWM-capable pin or API.',
      preset: { mode: 2, duty: 25 }, takeaway: 'Duty cycle is a time fraction, not a continuous pin voltage.', limitation: 'The apparent LED brightness and real ESP32 PWM peripheral behavior are not calculated.'
    },
    {
      id: 'analog-sensor', title: 'Analog sensors and ADC', summary: 'An ADC converts an allowed input voltage to a discrete code.',
      body: ['A variable sensor can supply a changing voltage. An analog-to-digital converter maps that voltage into a finite number of codes. The UNO R3 introductory example uses 10-bit codes 0–1023; the original ESP32 classroom example uses a 12-bit 0–4095 ideal range.', 'ESP32 ADC readings in physical builds need calibration and are not perfectly linear. A sensor output above the allowed input range must not be connected directly; the virtual lab clamps its reading only to illustrate range, not to model damage.'],
      equation: 'n\\approx\\operatorname{round}\\!\\left(\\frac{V_\\mathrm{in}}{V_\\mathrm{ref}}(2^b-1)\\right)', symbols: [['n', 'ideal ADC code'], ['V_in', 'input voltage, V'], ['V_ref', 'reference range, V'], ['b', 'ADC bits']], math: 'ratios', mathNotes: ['Normalize input voltage to the reference, multiply by the largest code and round. The board preset chooses b and V_ref.'],
      example: { question: 'What code is near 2.5 V on an ideal 5 V, 10-bit converter?', steps: ['Normalize 2.5/5=0.5.', 'Multiply 0.5 by 1023 and round.'], answer: '512.' },
      calculation: ['Find the ideal 10-bit code for 0 V input.', 0, '', 'Zero input maps to the minimum code zero.'],
      predict: ['Can a 5 V sensor output be connected directly to a nominal 3.3 V ESP32 ADC?', ['No', 'Yes'], 0, 'The physical input limit must be respected, possibly using a suitable divider or interface.'],
      check: ['At half the reference voltage, the ideal ADC code is near?', ['Half the full-scale code', 'Always zero'], 0, 'This ideal conversion scales the allowed voltage range linearly.'],
      lab: 'Choose Analog sensor and vary voltage. Compare ideal codes for the UNO and original ESP32 presets. Values above a board’s nominal reference are clipped in the diagram; clipping is not physical overvoltage protection.',
      preset: { mode: 3, analogVoltage: 2.5 }, takeaway: 'Interpret ADC codes using board-specific resolution and an allowed voltage range.', limitation: 'The original ESP32 ADC needs calibration and attenuation settings; this ideal scaling does not predict real conversion error.'
    }
  ]
});
