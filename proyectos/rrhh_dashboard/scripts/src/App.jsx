import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { nacionalidad, sexo, estadoCivil } from "./data";
import "./App.css";

const COLORS_NAC = "#2563eb";
const COLORS_SEXO = ["#2563eb", "#e879f9"];
const COLORS_CIVIL = ["#3b82f6", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#64748b"];
const TOTAL = 1068;

function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      {children}
    </div>
  );
}

const TooltipBar = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="tooltip">
      <p className="tt-name">{name}</p>
      <p className="tt-val">{value.toLocaleString("es-CL")} trabajadores</p>
      <p className="tt-pct">{((value / TOTAL) * 100).toFixed(1)}%</p>
    </div>
  );
};

const TooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="tooltip">
      <p className="tt-name">{name}</p>
      <p className="tt-val">{value.toLocaleString("es-CL")} trabajadores</p>
      <p className="tt-pct">{((value / TOTAL) * 100).toFixed(1)}%</p>
    </div>
  );
};

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * R);
  const y = cy + r * Math.sin(-midAngle * R);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700">
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="main-title">Resumen RRHH</h1>
        <span className="badge">{TOTAL.toLocaleString("es-CL")} trabajadores</span>
      </header>

      <main className="grid">

        {/* NACIONALIDAD */}
        <Card title="Nacionalidad">
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={nacionalidad} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#334155" }} width={95} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipBar />} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="value" fill={COLORS_NAC} radius={[0, 5, 5, 0]}>
                {nacionalidad.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#1d4ed8" : "#60a5fa"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* SEXO */}
        <Card title="Distribución por Sexo">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sexo} cx="50%" cy="50%" outerRadius={105} dataKey="value" labelLine={false} label={PieLabel}>
                {sexo.map((_, i) => <Cell key={i} fill={COLORS_SEXO[i]} />)}
              </Pie>
              <Tooltip content={<TooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="sexo-rows">
            {sexo.map((s, i) => (
              <div key={i} className="sexo-row">
                <span className="dot" style={{ background: COLORS_SEXO[i] }} />
                <span className="sexo-label">{s.name}</span>
                <span className="sexo-count">{s.value.toLocaleString("es-CL")}</span>
                <span className="sexo-pct" style={{ color: COLORS_SEXO[i] }}>
                  {((s.value / TOTAL) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ESTADO CIVIL */}
        <Card title="Estado Civil">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={estadoCivil} cx="50%" cy="50%" outerRadius={105} dataKey="value" labelLine={false} label={PieLabel}>
                {estadoCivil.map((_, i) => <Cell key={i} fill={COLORS_CIVIL[i]} />)}
              </Pie>
              <Tooltip content={<TooltipPie />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="civil-list">
            {estadoCivil.map((c, i) => (
              <div key={i} className="civil-row">
                <span className="dot" style={{ background: COLORS_CIVIL[i] }} />
                <span className="civil-name">{c.name}</span>
                <div className="civil-bar-wrap">
                  <div className="civil-bar" style={{ width: `${(c.value / estadoCivil[0].value) * 100}%`, background: COLORS_CIVIL[i] }} />
                </div>
                <span className="civil-count">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </main>
    </div>
  );
}
