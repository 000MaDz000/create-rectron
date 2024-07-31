# introduction
<b>create-rectron</b> package is a script to queck start to build a react, typescript, and tailwindcss application.
<br>
## why create-rectron
it is easy to use, and will create all configuration of your application automatically<br>
this will give you more time to develop your application instead of lose your time in repeat yourself<br>
<b>Don`t Repeat Yourself, programmer !</b>
<br>
## installation
run <code>npm install -g create-rectron</code> to install the script
<br>
## how to use
to use it, run <code>npx create-rectron</code> and the script will ask you:<br>
would you use typescript?<br>
would you use tailwindcss?<br>
and automatically will install create-react-app globally using <code>npm install -g create-react-app@latest</code><br>
then, will create the application with create-react-app then will configure all you need to run your electron application automatically
<br>
after that, write <code>npm start</code> to start your react development server<br>
then, write in other terminal <code>npm run main</code> to start your main process development environment
<br>
## script behaviour
first, it will install <b>create-react-app</b> last version globally<br>
then will use it to create the react application<br>
then will install dependecies of your app, if you using tailwind will install it, will install electron, ts-node, for give you a full development environment<br>
then, will configure your files, will add <b>ts-node</b> config into your <b>tsconfig.json</b> file<br>
if you use tailwindcss, will create <b>tailwind.config.json</b> and will include tailwindcss into <b>index.css</b> root css file.