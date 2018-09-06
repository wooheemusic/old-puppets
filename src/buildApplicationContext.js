import fs from "fs";
// import path from 'path';

// (예정) 일반화해야 한다.
// (예정) 주석 처리해도 반영되는데 수정해야한다.
function build(fileNames) {
  const mapper = [];
  let rootFilePath;

  const l = fileNames.length;
  for (let i = 0; i < l; i++) {
    const fileName = fileNames[i];
    console.log(i, fileName);
    const file = fs.readFileSync(fileName, "utf-8");
    // console.log(file);
    const matchMenuNo = file.match(/\n@MenuNo\(\d+\)/); // \n 수정해야함
    if (matchMenuNo !== null) {
      const firstMatch = matchMenuNo[0];
      const menuNo = firstMatch.slice(9, firstMatch.length - 1);
      // console.log(menuNo, fileName);
      mapper.push({ menuNo, fileName });
    }
    const matchRoot = file.match(/\n@ComponentScan/);
    if (matchRoot !== null) {
      rootFilePath = fileName.replace(/(\/[^/]+\/?|\/)$/, "");
      // rootFilePath = fileName.replace(/\/[^\/]+\/?$/, "");

      // @Autowired 방식으로 변경 예정. 일단은 @ComponentScan이 있는 directory에 applicationContext.js가 존재한다고 가정하고 코딩.
      // if (file.indexOf("import applicationContext from ") === -1) {
      //   const newFile = appendImports(
      //     file,
      //     `import applicationContext from './applicationContext';`
      //   );
      //   // console.log(newFile);
      //   fs.writeFileSync(fileName, newFile);
      // }
    }
  }
  // console.log(rootFilePath);

  if (typeof rootFilePath === "string") {
    const applicationContext = getApplicationContextFile(mapper, rootFilePath);
    // console.log(applicationContext);
    fs.writeFileSync(
      `${rootFilePath}/applicationContext.js`,
      applicationContext
    );
  }
}

function getApplicationContextFile(mapper, rootFilePath) {
  const comments =
    "/**\n  This script might be stale.\n  It will be refreshed at build time.\n*/\n";
  let importScript = "";
  let mapperScript = "";
  const rootFilePathLength = rootFilePath.length;
  const l = mapper.length;
  for (let i = 0; i < l; i++) {
    const { menuNo, fileName } = mapper[i];
    const componentName = getComponentName(fileName);
    const relativePath = getRelativePath(rootFilePathLength, fileName);
    importScript = `${importScript}import ${componentName} from '${relativePath}';\n`;
    mapperScript = `${mapperScript}\t{ menuNo: ${menuNo}, component: ${componentName} },\n`;
  }
  const applicationContextFile = `${comments}\n${importScript}\nconst mapper = [\n${mapperScript}];\n\nexport default mapper;\n`;
  // console.log("applicationContextFile");
  // console.log(applicationContextFile);
  return applicationContextFile;
}

function getRelativePath(rootFilePathLength, fileName) {
  return `.${fileName.slice(rootFilePathLength)}`;
}

function getComponentName(fileName) {
  const lastIndexOfSlash = fileName.lastIndexOf("/");
  return fileName.slice(
    lastIndexOfSlash + 1,
    fileName.length - 3 // only for javascript js, this will be updated for all sibling extentions.
  );
}

// (예정) 문제가 많다... 그리고 일반화 해야한다.
// function appendImports(file, imports) {
//   if (!imports.endsWith("\n")) {
//     imports = imports + "\n";
//   }
//   const start = getNextImportCaret(file);
//   const top = file.slice(0, start);
//   const bottom = file.slice(start);
//   file = top + imports + bottom;
//   return file;
// }

function getNextImportCaret(file, lastIndex = file.length) {
  const lastIndexOfImport = file.lastIndexOf("import ", lastIndex);
  if (lastIndexOfImport === -1) {
    return 0;
  }
  const indexOfFrom = file.indexOf(" from ", lastIndexOfImport);
  if (indexOfFrom === -1) {
    return getNextImportCaret(file, lastIndexOfImport - 1);
  }
  const ending = file.indexOf("\n", indexOfFrom);
  if (
    ending === -1 ||
    !/^\s*('|")(\w|\.|\/|@|-)+('|")\s*;?\s*?\r?\n$/.test(
      file.slice(indexOfFrom + 6, ending + 1) // 6 is " from "'s length
    )
  ) {
    return getNextImportCaret(file, lastIndexOfImport - 1);
  }
  console.log(lastIndexOfImport, indexOfFrom, ending);
  return ending + 1;
}

export default function buildApplicationContext(
  globPattern = "src/components/**/*.js"
) {
  const glob = require("glob");

  const fileNames = glob.sync(globPattern);

  build(fileNames);

  // throw new Error("STOP");
}
