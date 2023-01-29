module.exports = {
     sections: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Посетители онлайн', callback_data: '/online visitors'}],
                [{text: 'Список чатов', callback_data: '/сhat List'}],
                [{text: 'Настройки', callback_data: '/settings'}]
            ]
        })
    }
}