module.exports = {
     sections: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Экстремистские материалы', callback_data: '/extreme materials'}],
                [{text: 'Экстремистские организации', callback_data: '/extremist organizations'}],
                [{text: 'Нежелательные организации', callback_data: '/unwanted organizations'}],
                [{text: 'Организация по ИНН или ОГРН', callback_data:  '/organizations INN OGRN'}],
                [{text: 'Город по IP-адресу', callback_data:  '/IP city by address'}],
                [{text: 'Банк по БИК', callback_data:  '/bank by BIC'}],
                [{text: 'Аффилированные компании по ИНН', callback_data:  '/search for affiliated companies'}],
                [{text: 'Недействительный паспорт', callback_data:  '/invalid passport'}]
            ]
        })
    }
}