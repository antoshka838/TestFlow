import classes from "./activityCard.module.css";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import Header from "../../UI/cardHeader/Header";

const data = [
  { name: "Прошли", value: 18, fill: "#34C924" },
  { name: "Не прошли", value: 24, fill: "#E52327" },
];

const total = data.reduce((sum, num) => {
  return sum + num.value;
}, 0);

export default function ActivityCard() {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={classes.tooltip} style={{color: payload[0].fill}}>
          <span>{payload[0].name} {payload[0].value}</span>
        </div>
      );
    }
  };

  return (
    <div className={classes.cardContainer}>
      <Header>
        Респонденты
      </Header>
      <div className={classes.chartRow}>
        <div className={classes.chartWrapper}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={5}
                cornerRadius={50}
              />
              <Tooltip content={<CustomTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>

          <div className={classes.centerText}>
            {total} <br /> всего
          </div>
        </div>

        <div className={classes.stats}>
          {data.map((item) => (
            <div key={item.name} className={classes.statItem}>
              <span
                className={classes.color}
                style={{ backgroundColor: item.fill }}
              />
              <span>
                {item.name} {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
