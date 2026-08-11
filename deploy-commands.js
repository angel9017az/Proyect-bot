require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// ==================================================
// VALIDATE ENV
// ==================================================

if (!process.env.DISCORD_TOKEN) {

    console.error(
        "❌ DISCORD_TOKEN no está definido en .env"
    );

    process.exit(1);

}

if (!process.env.CLIENT_ID) {

    console.error(
        "❌ CLIENT_ID no está definido en .env"
    );

    process.exit(1);

}

if (!process.env.GUILD_ID) {

    console.error(
        "❌ GUILD_ID no está definido en .env"
    );

    process.exit(1);

}


// ==================================================
// COMMANDS
// ==================================================

const commands = [];

const commandsPath =
    path.join(__dirname, "commands");


const commandFiles =
    fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


// ==================================================
// LOAD COMMANDS
// ==================================================

for (const file of commandFiles) {

    const filePath =
        path.join(commandsPath, file);

    try {

        const command =
            require(filePath);


        if (
            !command.data ||
            !command.execute
        ) {

            console.log(
                `⚠️ ${file} no tiene una estructura válida.`
            );

            continue;

        }


        commands.push(
            command.data.toJSON()
        );


        console.log(
            `✓ Cargado: /${command.data.name}`
        );


    } catch (error) {

        console.error(
            `❌ Error cargando ${file}:`,
            error
        );

    }

}


// ==================================================
// REST
// ==================================================

const rest =
    new REST({
        version: "10"
    }).setToken(
        process.env.DISCORD_TOKEN
    );


// ==================================================
// DEPLOY
// ==================================================

(async () => {

    try {

        console.log("");
        console.log("========================================");
        console.log("🌙 LAST SHIFT — COMMAND DEPLOYMENT");
        console.log("========================================");

        console.log(
            `📦 Commands detected: ${commands.length}`
        );

        console.log(
            `🌐 Guild: ${process.env.GUILD_ID}`
        );

        console.log("");
        console.log(
            "🔄 Replacing existing commands..."
        );


        // ==================================================
        // THIS REPLACES ALL GUILD COMMANDS
        // ==================================================

        const registeredCommands =
            await rest.put(

                Routes.applicationGuildCommands(

                    process.env.CLIENT_ID,

                    process.env.GUILD_ID

                ),

                {
                    body: commands
                }

            );


        console.log("");
        console.log(
            `✅ ${registeredCommands.length} commands registered.`
        );


        console.log("");
        console.log(
            "📋 Current commands:"
        );


        for (
            const command
            of registeredCommands
        ) {

            console.log(
                `   /${command.name}`
            );

        }


        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            "✅ Deployment completed successfully."
        );
        console.log(
            "========================================"
        );


    } catch (error) {

        console.error("");
        console.error(
            "❌ Error registrando comandos:"
        );

        console.error(error);

    }

})();