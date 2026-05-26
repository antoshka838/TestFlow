import Header from "../../components/UI/header/Header";
import ActivityCard from "../../components/cards/activityCard/ActivityCard";
import classes from "./dashboard.module.css";
import LastComplitedTestsCard from "../../components/cards/lastComplitedTestsCard/LastComplitedTestsCard";
import BadTestCard from "../../components/cards/badTest/BadTestCard";
import GoodTest from "../../components/cards/goodTest/GoodTest";
import { $authHost } from "../../http";
import { useEffect, useState } from "react";
import Loader from "../../components/UI/loader/Loader";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    $authHost
      .get("api/dashboard/summary")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div>
        <Header title={"Главная"} />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header title={"Главная"} />
      <div className={classes.cardGrid}>
        <ActivityCard respondents={data.respondents} />
        <LastComplitedTestsCard tests={data.recentTests} />
        <BadTestCard test={data.problemTest} />
        <GoodTest test={data.bestTest} />
      </div>
    </div>
  );
}
