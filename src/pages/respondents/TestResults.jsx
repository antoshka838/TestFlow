import React from "react";
import { useParams } from "react-router";
import { tests } from "../../utils/tests";
import Header from "../../components/UI/header/Header";
import { users } from "../../utils/users";
import TestResultCard from "../../components/testResultCard/TestResultCard";
import { testResults } from "../../utils/testResults";

export default function TestResults() {
  const { id: userId, testId } = useParams();
  const user = users.find((u) => u.id === Number(userId));
  const testData = tests.find((t) => t.id === Number(testId));
  const result = testResults.find(
    (r) => r.userId === Number(userId) && r.testId === Number(testId),
  );

  const [lastName, firstName, surname] = user.fullName.split(" ");
  const title = `${lastName} ${firstName[0]}. ${surname[0]}.`;

  const testResult = result
    ? {
        testName: testData.name,
        score: result.score,
        correctAnswers: result.correctAnswers || 0,
        totalQuestions: result.totalQuestions || 0,
        accuracy: result.totalQuestions
          ? ((result.correctAnswers / result.totalQuestions) * 100).toFixed(0)
          : 0,
        timeSpent: `${Math.floor(result.timeSpent / 60)} мин. ${result.timeSpent % 60} сек.`,
        internalLoad: result.internalLoad,
        externalLoad: result.externalLoad,
        comment: result.comment,
      }
    : null;

  return (
    <div>
      <Header
        title={testData.name}
        crumbs={[
          { label: "Респонденты", to: "/respondents" },
          { label: title, to: `/respondents/${userId}` },
          { label: testData.name },
        ]}
      />
      <TestResultCard result={testResult} />
    </div>
  );
}
