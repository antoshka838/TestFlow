import Header from "../../components/UI/header/Header";
import ActivityCard from "../../components/cards/activityCard/ActivityCard";
import classes from "./dashboard.module.css"
import LastComplitedTestsCard from "../../components/cards/lastComplitedTestsCard/LastComplitedTestsCard";
import BadTestCard from "../../components/cards/badTest/BadTestCard";
import GoodTest from "../../components/cards/goodTest/GoodTest";

export default function Dashboard() {
  return (
    <div>
      <Header title={"Dashboard"}/>
      <div className={classes.cardGrid}>
        <ActivityCard />
        <LastComplitedTestsCard />
        <BadTestCard />
        <GoodTest />
      </div>
    </div>
  );
}
