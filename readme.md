# Server Side scripting 
  ## Setup 
  - Make a directory to keep api codes 
  - Execute `pnpm init` from the directory we created in last step
    - it will setup a `package.json` file for packages/dependency manage
  - Install `Express` using `pnpm <i/install/add> express`
  - Setup Dev-Dependency `pnpm i --save-dev @types/express @types/node nodemon ts-node typescript`
  - Add following scripts in `scripts` section from `package.json`
    ```json
    {
      ///....
      "scripts": {
        //....
        "start": "node dist/server.js",
        "dev": "nodemon --exec ts-node src/server.ts",
        "build": "tsc"
      }
      /// ....
    }
    ```
  - Initialize or configure `ts` for project
    - Manually create file `tsconfig.json` or run `tsc --init`
    - Copy or update `tsconfig.json` with the following codes 
    ```json
    {
      // Visit https://aka.ms/tsconfig to read more about this file
      "compilerOptions": {
        // custom codes
        "rootDir": "./src",
        "outDir": "./dist",
        
        "lib": ["ES2020"],
        "module": "CommonJS",
        "target": "ES2020",
        "types": ["node"],
        "moduleResolution": "node",

        "esModuleInterop": true,
        "allowJs": true,
        "pretty": true,
        "resolveJsonModule": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "isolatedModules": true,
        "skipLibCheck": true,
        "sourceMap": true,
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    }
    ```
  ## Express server 
    - Setup Server with express 
      - Create a file inside `src/` folder with name `server.ts`
      - create express application in `server.ts` file,
      ```ts
        import express, { type Express } from "express";

        // express application 
        const app: Express = express()

        const PORT = 9005
        const HOST = "127.0.0.1"

        // listen to the server 
        app.listen(PORT, HOST, (err) => {
          if(!err) {
            console.log(`Server is running on url http://${HOST}:${PORT}`)
            console.log("Press CTRL+C to discontinue server ...")
          }
        })
      ```
    - To run server `pnpm dev`
    
  ### For git ignore, 
    - Create a file named `.gitignore` in root folder
    - add `node_modules/`,`.env`,`*.log` on `.gitignore` file

### Receiving data from Client
  ```ts
      // headers => req.headers
      // query parameter => req.query, 
      // path parameters => req.params, 
      // body(json, x-www-urlencoded, form-data) => req.body
  ```

### File Upload using multer in router 
  ```ts 
    // file path: "/src/router/authRouter.ts 
    
    // ....
    authRouter.post("/auth/register", Uploader().single('image'), bodyValidator(RegisterSchema), authCtrl.userRegister);
    // authRouter.post("/auth/register", Uploader().none(), bodyValidator(RegisterSchema), authCtrl.userRegister);
    // authRouter.post("/auth/register", Uploader().array('image'), bodyValidator(RegisterSchema), authCtrl.userRegister);
    // authRouter.post("/auth/register", Uploader().fields([
    //   {name: "image", maxCount: 1},
    //   {name: "gallery", maxCount: 5}
    // ]), bodyValidator(RegisterSchema), authCtrl.userRegister);
    
    // ....
  ```

### Database 
  a. Relational DB (RDBMS)
  - mysql, mariadb, postgres, oracle, mssql, sqlite, etc.
  - Data are store in table format
  - sequelize, typeorm, prisma ORM provider

  b. Non-Relational DB (No-Relational DBMS)
  - Mongodb, couchdb
  - Data are stored in document format(Mainly JSON data)
  - Mongoose (ODM)  => Object Document Modelling
  

### Mongodb Usages 
  - Using local server(laptop setup server)
  - Using Cloud hosting(Atlas, per account 512mb of db cluster is free)