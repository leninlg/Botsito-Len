
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Archivos JSON
const bienvenida = require('./data/bienvenida.json');
const despedida = require('./data/despedida.json');
const reglas = require('./data/reglas.json');
const advertencias = require('./data/advertencias.json');
const cumpleaños = require('./data/cumpleaños.json');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot listo');
});

// Bienvenida y despedida
client.on('group_join', async (notification) => {
    if (!bienvenida.activa) return;
    const chat = await notification.getChat();
    client.sendMessage(chat.id._serialized, bienvenida.mensaje);
});

client.on('group_leave', async (notification) => {
    if (!despedida.activa) return;
    const chat = await notification.getChat();
    client.sendMessage(chat.id._serialized, despedida.mensaje);
});

// Comandos
client.on('message', async (msg) => {
    if (!msg.body.startsWith('!')) return;

    const args = msg.body.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🌟 Comandos básicos
    if (command === 'reglas') {
        msg.reply(reglas.texto);
    }

    else if (command === 'bienvenida') {
        bienvenida.activa = !bienvenida.activa;
        fs.writeFileSync('./data/bienvenida.json', JSON.stringify(bienvenida, null, 2));
        msg.reply(bienvenida.activa ? '✅ Bienvenida activada.' : '❌ Bienvenida desactivada.');
    }

    else if (command === 'despedida') {
        despedida.activa = !despedida.activa;
        fs.writeFileSync('./data/despedida.json', JSON.stringify(despedida, null, 2));
        msg.reply(despedida.activa ? '✅ Despedida activada.' : '❌ Despedida desactivada.');
    }

    else if (command === 'advertir') {
        if (!msg.hasQuotedMsg) return msg.reply('❌ Responde al mensaje de la persona que quieres advertir.');
        const quoted = await msg.getQuotedMessage();
        const id = quoted.author || quoted.from;
        advertencias[id] = (advertencias[id] || 0) + 1;
        fs.writeFileSync('./data/advertencias.json', JSON.stringify(advertencias, null, 2));
        msg.reply(`⚠️ Advertencia guardada. Total: ${advertencias[id]}`);
    }

    else if (command === 'veradvertencias') {
        let texto = '📄 Lista de advertencias:
';
        for (const id in advertencias) {
            texto += `• ${id}: ${advertencias[id]} advertencias
`;
        }
        msg.reply(texto);
    }

    else if (command === 'cumpleaños') {
        if (args.length < 1) return msg.reply('📅 Usa: !cumpleaños 15/08');
        cumpleaños[msg.from] = args[0];
        fs.writeFileSync('./data/cumpleaños.json', JSON.stringify(cumpleaños, null, 2));
        msg.reply(`🎉 Fecha de cumpleaños guardada: ${args[0]}`);
    }

    else if (command === 'vercumples') {
        let texto = '🎂 Cumpleaños registrados:
';
        for (const id in cumpleaños) {
            texto += `• ${id}: ${cumpleaños[id]}
`;
        }
        msg.reply(texto);
    }

    // 🛠️ Comandos de administración
    else if (command === 'ban' || command === 'kick') {
        if (!msg.hasQuotedMsg) return msg.reply('❌ Debes responder al mensaje de la persona.');
        const chat = await msg.getChat();
        if (!chat.isGroup) return msg.reply('❌ Solo funciona en grupos.');
        const quoted = await msg.getQuotedMessage();
        try {
            await chat.removeParticipants([quoted.author]);
            msg.reply('✅ Usuario expulsado.');
        } catch {
            msg.reply('❌ No puedo expulsarlo.');
        }
    }

    else if (command === 'tag') {
        const chat = await msg.getChat();
        if (!chat.isGroup) return msg.reply('❌ Solo en grupos.');
        let texto = '📢 Etiquetando a todos:
';
        let mentions = [];
        chat.participants.forEach(p => {
            texto += `@${p.id.user} `;
            mentions.push(p.id._serialized);
        });
        await chat.sendMessage(texto, { mentions });
    }

    // 🎮 Juegos
    else if (command === 'pregunta') {
        const respuestas = ['Sí', No', 'Tal vez', 'Claro', 'No lo creo'];
        const r = respuestas[Math.floor(Math.random() * respuestas.length)];
        msg.reply(`🔮 ${r}`);
    }

    else if (command === 'dado') {
        const n = Math.floor(Math.random() * 6) + 1;
        msg.reply(`🎲 Salió el número: ${n}`);
    }

    else if (command === 'caraocruz') {
        const r = Math.random() < 0.5 ? 'Cara 🪙' : 'Cruz 🪙';
        msg.reply(`Resultado: ${r}`);
    }

    // 💖 Comando de cariño (con gif)
    else if (command === 'abrazo') {
        msg.reply('🤗 Te mando un abrazo', null, {
            media: await MessageMedia.fromUrl('https://media.tenor.com/o5HzWqgL_FgAAAAC/abrazo-anime.gif')
        });
    }

    else if (command === 'beso') {
        msg.reply('😘 Te doy un beso', null, {
            media: await MessageMedia.fromUrl('https://media.tenor.com/Hk2r1hOZGc0AAAAC/kiss-anime.gif')
        });
    }
});

client.initialize();
