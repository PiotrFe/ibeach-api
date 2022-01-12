import { constants } from "fs";
import { access, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const allocateToProject = async ({ weekTs, data }) => {
  if (!data) {
    throw new Error("No data submitted");
  }

  const { day } = data;

  console.log({ data });

  const peopleFilePath = path.join(
    storageDir,
    "people",
    `${weekTs}`,
    "ready.json"
  );

  const projectFilePath = path.join(
    storageDir,
    "projects",
    `${weekTs}`,
    `${weekTs}.json`
  );

  try {
    const peopleFileContent = await readFile(peopleFilePath, "utf8");
    const projectFileContent = await readFile(projectFilePath, "utf8");
    const peopleData = JSON.parse(peopleFileContent);
    const projectData = JSON.parse(projectFileContent);

    if (day !== "match") {
      allocateSingleDay({
        peopleData,
        projectData,
        newEntry: data,
      });
    } else {
      allocateFullWeek({
        peopleData,
        projectData,
        newEntry: data,
      });
    }

    await Promise.all([
      writeFile(peopleFilePath, JSON.stringify(peopleData)),
      writeFile(projectFilePath, JSON.stringify(projectData)),
    ]);

    return { peopleData, projectData };
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
};

const getDaysLeft = (weekObj) => {
  return Object.values(weekObj).reduce((acc, val) => {
    if (typeof val === "boolean" && val === true) {
      return acc + 1;
    }
    return acc;
  }, 0);
};

const allocateSingleDay = ({ peopleData, projectData, newEntry }) => {
  const { person, project, day } = newEntry;

  const personIdx = peopleData.findIndex((entry) => entry.id === person.id);
  const projectIdx = projectData.findIndex((entry) => entry.id === project.id);
  const personWeek = {
    ...peopleData[personIdx].week,
    [day]: !project.value
      ? true
      : {
          id: project.id,
          text: project.value,
        },
  };

  const projectWeek = {
    ...projectData[projectIdx].week,
    [day]: !person.value
      ? true
      : {
          id: person.id,
          text: person.value,
        },
  };

  peopleData[personIdx] = {
    ...peopleData[personIdx],
    week: personWeek,
    daysLeft: getDaysLeft(personWeek),
  };
  projectData[projectIdx] = {
    ...projectData[projectIdx],
    week: projectWeek,
    daysLeft: getDaysLeft(projectWeek),
  };
};

const allocateFullWeek = ({ peopleData, projectData, newEntry }) => {
  const { person, project, day } = newEntry;

  if (!person && !project) {
    throw new Error("No data supplied");
  }

  if (!person || !project) {
    clearWeek({ peopleData, projectData, entry: newEntry });
    return;
  }

  const personIdx = peopleData.findIndex((entry) => entry.id === person.id);
  const projectIdx = projectData.findIndex((entry) => entry.id === project.id);

  const personEntry = peopleData[personIdx];
  const projectEntry = projectData[projectIdx];

  for (let weekDay of Object.keys(peopleData[personIdx].week)) {
    if (
      personEntry.week[weekDay] === true &&
      projectEntry.week[weekDay] === true
    ) {
      personEntry.week[weekDay] = {
        id: projectEntry.id,
        text: projectEntry.client,
      };
      projectEntry.week[weekDay] = {
        id: personEntry.id,
        text: personEntry.name,
      };
    }
  }
  personEntry.daysLeft = getDaysLeft(personEntry.week);
  projectEntry.daysLeft = getDaysLeft(projectEntry.week);
};

const clearWeek = ({ peopleData, projectData, entry }) => {
  const { person, project } = entry;
  const entryID = person ? person.id : project.id;
  const primaryDataSet = person ? peopleData : projectData;
  const seconDaryDataSet = person ? projectData : peopleData;
  const primaryEntry = primaryDataSet.find((entry) => entry.id === entryID);

  // loop through person's / project's calendar
  for (let [key, val] of Object.entries(primaryEntry.week)) {
    // if value is an obj (not boolean), it means there's an allocation entry
    if (typeof val === "object") {
      // change the value of weekday to true
      primaryEntry.week = {
        ...primaryEntry.week,
        [key]: true,
      };

      // find the index of the other entry (if person primary entry, then project and vice versa)
      const secondaryEntryIndex = seconDaryDataSet.findIndex(
        (elem) => elem.id == val.id
      );
      // change the value of that weekday to boolean true
      const secondaryEntryWeek = {
        ...seconDaryDataSet[secondaryEntryIndex].week,
        [key]: true,
      };
      const secondaryEntryDaysLeft = getDaysLeft(secondaryEntryWeek);

      seconDaryDataSet[secondaryEntryIndex] = {
        ...seconDaryDataSet[secondaryEntryIndex],
        week: secondaryEntryWeek,
        daysLeft: secondaryEntryDaysLeft,
      };
    }
  }
  primaryEntry.daysLeft = getDaysLeft(primaryEntry.week);
};
