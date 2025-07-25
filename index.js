
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

// Cargar datos desde JSON
const bienvenida = JSON.parse(fs.readFileSync('./data/bienvenida.json', 'utf8'));
const despedida = JSON.parse(fs.readFileSync('./data/despedida.json', 'utf8'));
const reglas = JSON.parse(fs.readFileSync('./data/reglas.json', 'utf8'));
const advertencias = JSON.parse(fs.readFileSync('./data/advertencias.json', 'utf8'));
const cumpleaños = JSON.parse(fs.readFileSync('./data/cumpleaños.json', 'utf8'));

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🤖 Bot listo!');
});

function mentionUser(mention) {
    return mention ? `@${mention.replace(/@c.us/, '')}` : '';
}

client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();

    if (!msg.body.startsWith('!')) return;

    const args = msg.body.split(' ');
    const command = args[0].toLowerCase();
    const mention = msg.mentionedIds[0];

    // 📌 COMANDOS DE ADMINISTRACIÓN
    if (command === '!grupo') {
        if (!chat.isGroup) return msg.reply('Este comando solo funciona en grupos.');
        if (!chat.participants.find(p => p.id._serialized === contact.id._serialized)?.isAdmin)
            return msg.reply('Solo los administradores pueden usar este comando.');

        const action = args[1];
        if (action === 'abrir') {
            await chat.setMessagesAdminsOnly(false);
            msg.reply('✅ El grupo ha sido abierto para todos.');
        } else if (action === 'cerrar') {
            await chat.setMessagesAdminsOnly(true);
            msg.reply('🔒 El grupo ha sido cerrado para solo administradores.');
        } else {
            msg.reply('Uso: !grupo abrir / cerrar');
        }
    }

    else if (command === '!setreglas') {
        const nuevasReglas = msg.body.slice(10).trim();
        reglas[chat.id._serialized] = nuevasReglas;
        fs.writeFileSync('./data/reglas.json', JSON.stringify(reglas, null, 2));
        msg.reply('✅ Reglas del grupo actualizadas.');
    }

    else if (command === '!reglas') {
        const reglasGrupo = reglas[chat.id._serialized];
        if (reglasGrupo) msg.reply(`📜 Reglas del grupo:
${reglasGrupo}`);
        else msg.reply('No se han establecido reglas aún.');
    }

    else if (command === '!setbienvenida') {
        const bienvenidaTexto = msg.body.slice(15).trim();
        bienvenida[chat.id._serialized] = bienvenidaTexto;
        fs.writeFileSync('./data/bienvenida.json', JSON.stringify(bienvenida, null, 2));
        msg.reply('✅ Mensaje de bienvenida configurado.');
    }

    else if (command === '!bienvenida') {
        const bienvenidaGrupo = bienvenida[chat.id._serialized];
        if (bienvenidaGrupo) msg.reply(`👋 Mensaje de bienvenida:
${bienvenidaGrupo}`);
        else msg.reply('No se ha configurado la bienvenida aún.');
    }

    else if (command === '!setdespedida') {
        const despedidaTexto = msg.body.slice(14).trim();
        despedida[chat.id._serialized] = despedidaTexto;
        fs.writeFileSync('./data/despedida.json', JSON.stringify(despedida, null, 2));
        msg.reply('✅ Mensaje de despedida configurado.');
    }

    else if (command === '!despedida') {
        const despedidaGrupo = despedida[chat.id._serialized];
        if (despedidaGrupo) msg.reply(`👋 Mensaje de despedida:
${despedidaGrupo}`);
        else msg.reply('No se ha configurado la despedida aún.');
    }

    else if (command === '!warn') {
        const user = mention;
        if (!user) return msg.reply('Debes mencionar a un usuario para advertir.');
        advertencias[user] = (advertencias[user] || 0) + 1;
        fs.writeFileSync('./data/advertencias.json', JSON.stringify(advertencias, null, 2));
        msg.reply(`⚠️ Usuario advertido. Total de advertencias: ${advertencias[user]}`);
    }

    else if (command === '!verwarn') {
        const user = mention;
        if (!user) return msg.reply('Debes mencionar a un usuario.');
        const cantidad = advertencias[user] || 0;
        msg.reply(`⚠️ ${mentionUser(user)} tiene ${cantidad} advertencias.`);
    }

    // 🎀 COMANDOS DE CARIÑO CON GIFS
    else if (command === '!abrazo') {
        if (mention) msg.reply(`🤗 Un abrazo para ${mentionUser(mention)} https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif`);
        else msg.reply('🤗 ¡Aquí tienes un abrazo virtual! https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif');
    }

    else if (command === '!beso') {
        if (mention) msg.reply(`😘 Un beso para ${mentionUser(mention)} https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif`);
        else msg.reply('😘 ¡Te mando un beso virtual! https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif');
    }

    else if (command === '!apapacho') {
        if (mention) msg.reply(`🫂 Un apapacho para ${mentionUser(mention)} 💖 https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif`);
        else msg.reply('🫂 ¡Aquí tienes un apapacho especial! 💖 https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif');
    }

    else if (command === '!mimos') {
        if (mention) msg.reply(`🐱 Mimos para ${mentionUser(mention)} 💆 https://media.giphy.com/media/KOVlHmbBA09XO/giphy.gif`);
        else msg.reply('🐱 ¡Te mando mimos! 💆 https://media.giphy.com/media/KOVlHmbBA09XO/giphy.gif');
    }

    else if (command === '!tequiero') {
        if (mention) msg.reply(`💗 ${mentionUser(mention)}, ¡te quiero mucho! https://media.giphy.com/media/fHtb1JPbfph72/giphy.gif`);
        else msg.reply('💗 ¡Te quiero mucho! https://media.giphy.com/media/fHtb1JPbfph72/giphy.gif');
    }
});
