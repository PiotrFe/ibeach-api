import { constants } from "fs";
import { access, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { storageDir } from "../server.js";

export const allocateToProject = async ({ weekTs, data }) => {
  if (!data) {
    throw new Error("No data submitted");
  }

  const { person, project, day } = data;

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

    const personIdx = peopleData.findIndex((entry) => entry.id === person.id);
    const projectIdx = projectData.findIndex(
      (entry) => entry.id === project.id
    );
    peopleData[personIdx] = {
      ...peopleData[personIdx],
      week: {
        ...peopleData[personIdx].week,
        [day]: project.value,
      },
    };
    projectData[projectIdx] = {
      ...projectData[personIdx],
      week: {
        ...projectData[personIdx].week,
        [day]: person.value,
      },
    };

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
