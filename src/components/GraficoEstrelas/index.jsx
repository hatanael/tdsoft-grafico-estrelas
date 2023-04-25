import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const agruparPorData = (estrelas, agrupamento) => {
  let agrupamentoPorData = estrelas.reduce((acc, estrela) => {
    const data = new Date(estrela.starred_at);

    if (agrupamento === 'dia') {
      data.setHours(0, 0, 0, 0);} 
    else if (agrupamento === 'semana') {
      data.setDate(data.getDate() - data.getDay());
      data.setHours(0, 0, 0, 0);} 
    else if (agrupamento === 'mes') {
      data.setDate(1);
      data.setHours(0, 0, 0, 0);
    } else if (agrupamento === 'ano') {
      data.setMonth(0, 1);
      data.setHours(0, 0, 0, 0);
    }
    if (acc[data]) {
      acc[data] += 1;
    } else {
      acc[data] = 1;
    }
    return acc;
  }, {});

  agrupamentoPorData = Object.entries(agrupamentoPorData).sort((a, b) => {
    return new Date(a[0]) - new Date(b[0]);
  });
  return agrupamentoPorData.map((data) => {
    return { date: data[0], estrelas: data[1] };
  });
};

function getWeek(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const timeDiff = date - oneJan;
  const dayOfYear = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const weekNum = Math.ceil(dayOfYear / 7);
  return weekNum;
}

const organizaDateTime = (data, agrupamento) => {
  data.forEach((item) => {
    const data = new Date(item.date);
    if (agrupamento === 'dia')
      item.date = `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`;
    else if (agrupamento === 'semana') {
      const semana = getWeek(data);
      item.date = `${semana}/${data.getFullYear()}`;
    }
    else if (agrupamento === 'mes')
      item.date = `${data.getMonth() + 1}/${data.getFullYear()}`;
    else if (agrupamento === 'ano')
      item.date = `${data.getFullYear()}`;
  });
  return data;
};

const aplicarEscalaLog = (data, escala, agrupamento) => {
  if (escala === 'log') {
    data.forEach((item) => {
      item.estrelas = Math.log10(item.estrelas);
    });
  }
  organizaDateTime(data, agrupamento);
  return data;
}


const aplicarAcumulativo = (data) => {
  for (let i = 1; i < data.length; i++) {
    data[i].estrelas += data[i - 1].estrelas;
  }
  return data;
}

const RenderLineChart = (props) => {
  return (
    <LineChart
      width={1330}
      height={650}
      data={props.data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis scale={props.escala} />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="estrelas" stroke="#8884d8" />
    </LineChart>
  );
};

export function GraficoEstrelas(props) {
  const agrupamentoPorData = agruparPorData(props.estrelas, props.agrupamento);
  const dadosComEscala = aplicarEscalaLog(agrupamentoPorData, props.escala, props.agrupamento);
  const result = props.cumulativa ? aplicarAcumulativo(dadosComEscala) : dadosComEscala;

  return <div><RenderLineChart data={result} /></div>;
}

// Definição dos tipos das propriedades recebidas.
GraficoEstrelas.propTypes = {
  estrelas: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.string.isRequired,
      starred_at: PropTypes.instanceOf(Date).isRequired,
    })
  ).isRequired,
  agrupamento: PropTypes.oneOf(['dia', 'semana', 'mes', 'ano']),
  escala: PropTypes.oneOf(['linear', 'log']),
  cumulativa: PropTypes.bool, // bonus
};

// Definição dos valores padrão das propriedades.
GraficoEstrelas.defaultProps = {
  agrupamento: 'dia',
  escala: 'linear',
  cumulativa: false, // bonus
};
