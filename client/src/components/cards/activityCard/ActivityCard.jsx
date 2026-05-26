import classes from "./activityCard.module.css";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import Header from "../../UI/cardHeader/Header";

export default function ActivityCard({respondents}) {
  const passed = respondents?.passed || 0;
  const failed = respondents?.failed || 0;

  const chartData = [
    { name: "Прошли", value: passed, fill: "#34C924" },
    { name: "Не прошли", value: failed, fill: "#E52327" },
  ];

  const total = passed + failed;

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
      <Header linkTo="/respondents">
        Респонденты
      </Header>
      <div className={classes.chartRow}>
        <div className={classes.chartWrapper}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
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
          {chartData.map((item) => (
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
