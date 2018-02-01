const ncp   = require('ncp').ncp;
const prm   = require('promptly');
const fs    = require('fs');
const spawn = require('child_process').spawn;
const fork  = require('child_process').fork;

const FgRed                     = "\x1b[31m";
const FgGreen                   = "\x1b[32m";
const FgYellow                  = "\x1b[33m";
const Reset                     = "\x1b[0m";

// const PATH_SANDBOX_TEMPLATE     = './template-recipe';
// const PATH_FRONT_TEMPLATE       = './template-front';
// const PATH_TEST_CLI             = './template-cli';
const PATH_INTRO_FILE           = './intro.txt';
const PROMPT_CURSOR             = FgGreen+'z>'+Reset;
const DEPLOY_NB_LINE            = 28;

const COMMANDS_MESSAGE          = `\nAvailables commands : 
  [new]   : Create new project
  [serve] : Serve Node Backend
  [exit]  : Exit`;
const RELOAD_MIN_TIME           = 600; //ms

// Those crendentials should be in the home of user
// if not, then a prompt ask for its
let SANDBOX_CRED                = {
    name                        : "lapin",
    login                       : "modez.martin@zetapush.com", 
    sandboxId                   : "S1F-PT6V",
    password                    : "caspierre"
};

let g_config = SANDBOX_CRED;
SANDBOX_CRED = false; // uncomment for prompt credentials

let isServing = false;
let lastReloadTime = Date.now();

const initSandbox = () => {
    return new Promise(resolve => {
        fs.readFile('./recipes/zms.properties.template', 'utf8', (err, data) => {
            let newData = data
            .replace('@SANDBOX_ID', g_config.sandboxId)
            .replace('@USERNAME', g_config.login)
            .replace('@PASSWORD', g_config.password);
            fs.writeFile('./recipes/zms.properties', newData, () => {
                resolve();
            })
        });
    })
}

const setCli = () => {
    console.log('Creating CLI');
    return new Promise(resolve => {
        fs.readFile('../examples-v3/t_package.json', 'utf8', (err, data) => {
            let newData = data
            .replace('@SANDBOX_ID', g_config.sandboxId)
            .replace('@USERNAME', g_config.login)
            .replace('@PASSWORD', g_config.password);
            fs.writeFile('../examples-v3/package.json', newData, () => {
                resolve();
            });
        });
    });
}

const makeFrontSample = () => {
    return new Promise(resolve => {
        fs.readFile('../examples-v3/public/index.js.template', 'utf8', (err, data) => {
            let newData = data
            .replace('@SANDBOX_ID', g_config.sandboxId)
            fs.writeFile('../examples-v3/public/index.js', newData, () => {
                resolve();
            });
        });
    })
}

const getProgress = (nbrStep, maxStep) => {
    let str = " <"+FgGreen;
    let i;
    for (i = 0; i <= nbrStep; i++)
        str += "=";
    str += ">"+FgYellow
    for (i ; i <= maxStep; i++)
        str += "-";
    str += Reset+">";
    return str;
}

const deploySandBox = (config) => {
    return new Promise(resolve => {
        let zms = spawn('zms', ['deployRecipe', '-i' ,'./recipes/']);
        let nbOut = 0;
        console.log('\nDeploying new sandbox to the Zetapush server:');
        zms.stdout.on('data', (data) => {
            nbOut++;
            process.stdout.write('\r' + getProgress(nbOut,DEPLOY_NB_LINE));
        })
        zms.stderr.on('data', (data) => {
            console.log('\n' | data.toString());
        })
        zms.on('exit', function (code) {
            process.stdout.write('\r                                                     ');
            if (code.toString() === '0'){
                console.log(FgGreen+'\nSandBox deployed ! '+Reset);
                resolve(true);
            }else {
                console.log('Sandbox not deployed :|');
                resolve(false);
            }
        });
    });
}


function serve(){
    return new Promise(resolve =>{
        // let yarn = spawn('./'+g_config.name+'-cli/node_modules/zetapush-cli/bin/cli.js', ['./'+g_config.name+'-cli']);
        let node = fork('../examples-v3/node_modules/zetapush-cli/bin/cli.js', ['../examples-v3/']);

        fs.watch('../examples-v3/public', () => {
            if (Date.now() - lastReloadTime > RELOAD_MIN_TIME){
                console.log("Live Reload ", Date.now() -lastReloadTime);
                while (!node.killed){
                    node.kill('SIGKILL');
                }
                if (node.killed)
                    node = fork('../examples-v3/node_modules/zetapush-cli/bin/cli.js', ['../examples-v3/']);
            }
            lastReloadTime = Date.now();
        })  
        // node.on("exit", () => {
            // resolve();
        // });
        process.on('SIGINT', () => {
            node.kill("SIGKILL")
            resolve();
        });
    });
}



const mainLoop = async (command) => {
    console.log(COMMANDS_MESSAGE);
    if (!command){
        command = await prm.prompt(PROMPT_CURSOR);
    }
    
    // NEW PROJECT
    if (command === 'new'){
        let config = {}
        if (!SANDBOX_CRED){
            g_config.name = (await prm.prompt('Enter Name of Project '+PROMPT_CURSOR)).trim();
            g_config.sandboxId = (await prm.prompt('Enter SandBox ID of Project '+PROMPT_CURSOR)).trim();
            g_config.login = (await prm.prompt('Enter Zetapush Login '+PROMPT_CURSOR)).trim();
            g_config.password = await prm.prompt('Enter Zetapush Password '+PROMPT_CURSOR);
        }else {
            g_config = SANDBOX_CRED;
            g_config.name = (await prm.prompt('Enter Name of Project ' + PROMPT_CURSOR)).trim();
        }
        await initSandbox(g_config);
        // if (true){
        if (await deploySandBox(config)){
            await setCli(g_config);
            await makeFrontSample();
        }else{
            console.log("ERREUR . . ");
        }
    }
    
    //SERVE NODEJS WITH AUTO RELOAD
    else if (command === 'serve'){
        isServing = true;
        await serve();
        isServing = false;
    }

    //EXIT
    else if (command === 'exit'){
        process.exit(0);
    }

    //COMMAND NOT FOUND
    else {
        console.log(FgRed+'\nInvalid command : ' + command + Reset) ;
    }
    mainLoop()
}
process.on('unhandledRejection', (reason, p) => {
    console.log(reason);
    process.exit(0);
});

// initSandbox()

fs.readFile(PATH_INTRO_FILE, 'utf8', (err, data) => {
    console.log(FgRed+data+Reset);
    mainLoop(process.argv[2]);
});






// OLD

// const setCli = (config) => {
//     console.log('Creating CLI');
//     return new Promise(resolve => {
//         ncp(PATH_TEST_CLI, './'+config.name+'-cli', () => {
//             fs.readFile('./'+config.name+'-cli/package.json', 'utf8', (err, data) => {
//                 let newData = data
//                 .replace('@SANDBOX_ID', config.sandboxId)
//                 .replace('@USERNAME', config.login)
//                 .replace('@PASSWORD', config.password);
//                 fs.writeFile('./'+config.name+'-cli/package.json', newData, () => {
//                     // let zms = spawn('yarn', ['deployRecipe', '-i' ,'./'+config.name+'-recipes/']);
//                     let yarn = spawn('yarn', {cwd : './'+config.name+'-cli'});
//                     yarn.stdout.on('data', (data) => {
//                         console.log(data.toString());
//                     })
//                     yarn.stderr.on('data', (data) => {
//                         console.log('\n' + data.toString());
//                     })
//                     yarn.on('exit', function (code) {
//                         if (code.toString() === '0'){
//                             console.log(FgGreen+'\nCLI installed ! '+Reset);
//                             resolve(true);
//                         }else {
//                             console.log('probleme Installing CLI');
//                             resolve(false);
//                         }
//                     });
//                 });
//             });
//         });
//     });
// }

// function initServe(){
//     return new Promise(resolve =>{
//         // let yarn = spawn('yarn',['start'], {cwd : './'+g_config.name+'-cli', detached: true});
//         let yarn = spawn('./'+g_config.name+'-cli/node_modules/zetapush-cli/bin/cli.js', ['./'+g_config.name+'-cli']);
//         lastReloadTime = Date.now();
//         yarn.stdout.on('data', (data) => {
//             console.log(data.toString());
//         })
//         yarn.stderr.on('data', (data) => {
//             console.log('\n' | data.toString());
//         })
//         yarn.on('exit', function (code) {
        
//         });
//         fs.watch('./'+g_config.name+'-cli', () => {
//             if (Date.now() - lastReloadTime > RELOAD_MIN_TIME){
//                 console.log("Live Reload ", Date.now() -lastReloadTime);
//                 yarn.kill('SIGKILL');
//                 setTimeout(initServe,20);
//             }
//             lastReloadTime = Date.now();
//         })
//         process.on('SIGINT', () => {
//             if (isServing){
//                 yarn.kill('SIGKILL');
//                 resolve();
//             }
//         });
//     });
// }