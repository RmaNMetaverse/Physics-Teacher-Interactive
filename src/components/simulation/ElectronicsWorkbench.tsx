import { useState } from 'react';
import type { ModelId, Parameters, SimulationState } from '../../types';
import { formatNumber } from '../../lib/format';

type Props = { modelId: Extract<ModelId, 'circuits' | 'microcontroller'>; parameters: Parameters; state: SimulationState; onChange: (key: string, value: number) => void };
const circuitNames = ['Resistor loop', 'Series pair', 'Parallel branches', 'LED loop'];
const boardNames = ['Blink', 'Button input', 'PWM dimming', 'Analog sensor'];

export function ElectronicsWorkbench({ modelId, parameters: p, state, onChange }: Props) {
  const [view, setView] = useState<'schematic' | 'wiring'>('schematic');
  const observation = (key: string) => state.observations.find(o => o.key === key)?.value ?? 0;
  const isCircuit = modelId === 'circuits';
  const active = isCircuit ? observation('totalCurrent') > 0 : observation('ledCurrent') > 0;
  const mode = p.mode ?? 0;
  const names = isCircuit ? circuitNames : boardNames;
  const switchValue = p.switchClosed ?? 1;
  const board = p.board === 1 ? 'Original ESP32' : 'Arduino UNO R3';
  return <div className="electronics-workbench" role="region" aria-label={isCircuit ? 'Interactive circuit workbench' : 'Interactive board workbench'}>
    <div className="electronics-workbench-head">
      <div><span className="electronics-overline">VIRTUAL WORKBENCH</span><strong>{isCircuit ? names[mode] : `${board} · ${names[mode]}`}</strong></div>
      <div className="electronics-view-tabs" role="group" aria-label="Workbench view">
        <button type="button" aria-pressed={view === 'schematic'} className={view === 'schematic' ? 'active' : ''} onClick={() => setView('schematic')}>Schematic</button>
        <button type="button" aria-pressed={view === 'wiring'} className={view === 'wiring' ? 'active' : ''} onClick={() => setView('wiring')}>Wiring</button>
      </div>
    </div>
    {isCircuit ? <>
      {view === 'schematic' ? <svg className="electronics-diagram" viewBox="0 0 600 330" role="img" aria-label={`${names[mode]} schematic with ${switchValue ? 'closed' : 'open'} switch`}>
        <defs><pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#426378" strokeOpacity=".2"/></pattern></defs>
        <rect width="600" height="330" fill="url(#circuit-grid)"/>
        <g className={active ? 'wire-live' : 'wire-idle'} fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d={mode === 1 ? 'M100 95H190M270 95H290M370 95H430M510 95H530V260H100V95' : mode === 3 ? 'M100 95H190M270 95H350M460 95H530V260H100V95' : 'M100 95H190M270 95H430M510 95H530V260H100V95'}/>
          {mode === 2 ? <path d="M300 95V190H290M370 190H460V95"/> : null}
        </g>
        <g className="diagram-component"><path d="M100 165v30m-18 0h36m-25 10h14m-7 0v55"/><text x="48" y="225">{p.voltage} V</text></g>
        <g className="diagram-component"><circle cx="190" cy="95" r="5"/><circle cx="270" cy="95" r="5"/><path d={switchValue ? 'M190 95H270' : 'M190 95L258 66'}/><text x="205" y="68">SW</text></g>
        {mode === 3 ? <g className="diagram-component"><path d="M430 80L460 95L430 110Z M460 78V112 M471 73l20-20m-12 25l20-20"/><text x="428" y="146">LED ≈ {p.ledDrop} V</text></g> : <g className="diagram-component"><path d="M430 95l10-13 10 26 10-26 10 26 10-26 10 26 10-13"/><text x="435" y="146">R1 {p.resistance} Ω</text></g>}
        {mode === 1 ? <g className="diagram-component"><path d="M290 95l10-13 10 26 10-26 10 26 10-26 10 26 10-13"/><text x="298" y="70">R2 {p.resistance2} Ω</text></g> : null}
        {mode === 2 ? <g className="diagram-component"><path d="M290 190l10-13 10 26 10-26 10 26 10-26 10 26 10-13"/><text x="295" y="228">R2 {p.resistance2} Ω</text></g> : null}
        {mode === 3 ? <g className="diagram-component"><path d="M350 95l10-13 10 26 10-26 10 26 10-26 10 26 10-13"/><text x="356" y="70">R {p.resistance} Ω</text></g> : null}
        <text className="diagram-caption" x="300" y="305" textAnchor="middle">Trace the loop from supply → switch → component → ground</text>
      </svg> : <div className="electronics-wiring-view" aria-label="Breadboard-style connection diagram">
        <div className="virtual-supply"><span>DC supply</span><strong>{p.voltage} V</strong><small>+ / −</small></div>
        <div className="virtual-lead" aria-hidden="true"/>
        <div className="virtual-breadboard"><div className="breadboard-rail">+ + + + + + + + + +</div><div className="breadboard-row"><span>SW</span><span>R1<br/>{p.resistance} Ω</span>{mode === 1 || mode === 2 ? <span>R2<br/>{p.resistance2} Ω</span> : null}{mode === 3 ? <span className={active ? 'virtual-led on' : 'virtual-led'}>LED</span> : null}</div><div className="breadboard-gap">center trench · separate nodes</div><div className="breadboard-row holes" aria-hidden="true">○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○</div><div className="breadboard-rail ground">− − − − − − − − − −</div></div>
        <p>{mode === 2 ? 'Parallel: both resistors connect across the same two supply nodes.' : 'Each component spans distinct nodes along the intended loop.'}</p>
      </div>}
      <button className="workbench-toggle" type="button" aria-pressed={switchValue === 1} onClick={() => onChange('switchClosed', switchValue ? 0 : 1)}>{switchValue ? 'Open switch' : 'Close switch'}</button>
    </> : <>
      {view === 'schematic' ? <svg className="electronics-diagram" viewBox="0 0 600 330" role="img" aria-label={`${board} ${names[mode]} connection schematic`}>
        <rect x="70" y="66" width="230" height="200" rx="20" fill="#1b514d" stroke="#6dd7b9" strokeWidth="3"/>
        <text className="board-svg-name" x="185" y="123" textAnchor="middle">{board}</text>
        <text className="board-svg-small" x="185" y="157" textAnchor="middle">{observation('logicVoltage')} V logic</text>
        <circle cx="300" cy="190" r="6" fill="#f7ca79"/><text className="board-svg-small" x="240" y="185">PIN</text>
        <path d="M306 190H390M510 190H550V267H185M185 267V250" fill="none" stroke={active ? '#5fe2cf' : '#668591'} strokeWidth="4"/>
        {mode === 3 ? <g className="diagram-component"><path d="M400 165h100v50H400z"/><text x="409" y="193">SENSOR</text><text x="410" y="239">{formatNumber(observation('sensorVoltage'))} V</text></g>
          : <g className="diagram-component"><path d="M390 190l10-13 10 26 10-26 10 26 10-13M460 175l20 15-20 15zM480 173v34"/><text x="390" y="230">R + LED</text></g>}
        {mode === 1 ? <g className="diagram-component"><path d="M385 74h35m30 0h35M420 74l28-22"/><text x="381" y="115">BUTTON</text></g> : null}
        <text className="diagram-caption" x="300" y="307" textAnchor="middle">Functional schematic · illustrative pin connection</text>
      </svg> : <div className="board-demo wiring">
        <div className="virtual-board"><span>{board}</span><strong>{p.board === 1 ? 'GPIO' : 'D13 / A0'}</strong><small>{observation('logicVoltage')} V logic · GND</small><div className="board-pin-row" aria-hidden="true">▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣</div></div>
        <div className="board-wires" aria-hidden="true"><span className={active ? 'live' : ''}/><span/></div>
        <div className="board-peripheral"><span>{mode === 3 ? 'Analog sensor' : mode === 1 ? 'Pulled button + LED' : 'Series resistor + LED'}</span><div className={active ? 'virtual-led on' : 'virtual-led'} aria-label={active ? 'LED illuminated' : 'LED off'}>LED</div>{mode === 3 ? <strong>{formatNumber(observation('sensorVoltage'))} V</strong> : null}</div>
      </div>}
      {mode === 1 ? <button className="workbench-toggle" type="button" aria-pressed={p.buttonPressed === 1} onClick={() => onChange('buttonPressed', p.buttonPressed ? 0 : 1)}>{p.buttonPressed ? 'Release button' : 'Press button'}</button> : null}
      <pre className="board-code" aria-label="Illustrative programming pattern"><code>{mode === 0 ? 'setup(): pinMode(LED, OUTPUT)\nloop(): HIGH → wait → LOW → wait' : mode === 1 ? 'setup(): configure pulled input\nloop(): read button → update LED' : mode === 2 ? 'setup(): configure PWM output\nloop(): set duty cycle' : 'setup(): configure analog input\nloop(): read ADC → interpret voltage'}</code></pre>
    </>}
    <div className="electronics-readouts" aria-live="polite">
      {isCircuit ? <><span><small>Total current</small><strong>{formatNumber(observation('totalCurrent') * 1000)} mA</strong></span><span><small>Equivalent R</small><strong>{formatNumber(observation('equivalentResistance'))} Ω</strong></span><span><small>Supply power</small><strong>{formatNumber(observation('power') * 1000)} mW</strong></span></> : <><span><small>{mode === 3 ? 'Sensor voltage' : 'Logic level'}</small><strong>{mode === 3 ? `${formatNumber(observation('sensorVoltage'))} V` : observation('pinHigh') ? 'HIGH' : 'LOW'}</strong></span><span><small>{mode === 3 ? 'ADC resolution' : 'LED current (avg.)'}</small><strong>{mode === 3 ? p.board === 1 ? '12 bit' : '10 bit' : `${formatNumber(observation('ledCurrent') * 1000)} mA`}</strong></span><span><small>{mode === 3 ? 'Ideal ADC code' : mode === 2 ? 'PWM duty' : mode === 0 ? 'Blink period' : 'Button input'}</small><strong>{mode === 3 ? observation('adcCode') : mode === 2 ? `${p.duty}%` : mode === 0 ? `${p.period} s` : p.buttonPressed ? 'PRESSED' : 'RELEASED'}</strong></span></>}
    </div>
    <p className="electronics-model-note">{isCircuit ? 'Ideal DC templates; the LED uses a fixed forward voltage. Diagram proportions are illustrative.' : 'Predefined behavior only; no sketch compilation or board-specific pinout. Verify real wiring against your exact board.'}</p>
  </div>;
}
