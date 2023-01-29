const { sections } = require('./sections');
const { 
    findMaterials,
    findExtremistOrganizations,
    findUnwanted_organizations
  } = require('../apiDatabase/api');
const rp = require('request-promise');
var token = "b0d3b1d3ade2d9a02cf419f9b391957af39716fd";


module.exports = (id, text, section = null, bot) => {
    console.log(section)
    if(text === '/noAccess') return bot.sendMessage(id,'Введите пароль: ');
    if(text === '/start'){
      bot.sendMessage(id, 'Настоящий бот предоставляет функции поиска по списку экстремистских материалов, экстремистских и нежелательных организаций, запрещенных на территории Российской Федерации, опубликованному на сайте \nminjust.gov.ru');
      setTimeout(() => bot.sendMessage(id, 'Выберите раздел: ', sections), 500);  
    }else{
        if(section === null){
            setTimeout(() => bot.sendMessage(id, 'Выберите раздел: ', sections), 500);
        }else if (section === '/extreme materials') {
            findMaterials(text)  
              .then(result => {
                  if (result.length > 20) {
                    bot.sendMessage(id, 'Найдено более 20 записей, попробуйте уточнить поиск.');
                  } else if (result.length === 0) {
                    bot.sendMessage(id, 'Записей не найдено, попробуйте уточнить поиск.');
                  } else {
                    result.forEach((currentValue, index, array) => {
                      bot.sendMessage(id, currentValue.contentSnippet);
                    })
                  }
                }
              )
          } else if(section === '/extremist organizations') {
            findExtremistOrganizations(text)  
              .then(result => {
                  console.log(result)
                  if (result.length > 20) {
                    bot.sendMessage(id, 'Найдено более 20 записей, попробуйте уточнить поиск.');
                  } else if (result.length === 0) {
                    bot.sendMessage(id, 'Записей не найдено, попробуйте уточнить поиск.');
                  } else {
                    result.forEach((currentValue, index, array) => {
                      bot.sendMessage(id, currentValue.content);
                    })
                  }
                }
              )
          } else if(section === '/unwanted organizations') { 
            findUnwanted_organizations(text)  
              .then(result => {
                console.log(result)
                  if (result.length > 20) {
                    bot.sendMessage(id, 'Найдено более 20 записей, попробуйте уточнить поиск.');
                  } else if (result.length === 0) {
                    bot.sendMessage(id, 'Записей не найдено, попробуйте уточнить поиск.');
                  } else {
                    result.forEach((currentValue, index, array) => {
                      bot.sendMessage(id, currentValue.content);
                    })
                  }
                }
              )
          } else if(section === '/organizations INN OGRN') {
            let options = {
              uri: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
              method: "POST",
              mode: "cors",
              headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
              },
              body: JSON.stringify({query: text})
          };
          
          rp(options)
              .then(function (repos) {
                let res = JSON.parse(repos);
                let name = res.suggestions[0].value + '\n';
                let kpp = 'КПП: ' + res.suggestions[0].data.kpp + '\n';
                let management = 'руководитель: '  + res.suggestions[0].data.management.name + '\n';
                let post = 'должность: ' + '\n' + res.suggestions[0].data.management.post + '\n';
                let inn = 'ИНН: '  + res.suggestions[0].data.inn + '\n';
                let ogrn = 'ОГРН: '  + res.suggestions[0].data.ogrn + '\n';
                let address = 'адрес: '  + res.suggestions[0].data.address.value + '\n';
                bot.sendMessage(id, name + kpp + management + post + inn + ogrn + address);
              })
              .catch(function (err) {
                bot.sendMessage(id, 'Некорректный № ИНН, уточните запрос.');
                console.log(err);
              });
          } else if (section === '/IP city by address') {
            let options = {
              uri: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/iplocate/address?ip='+ text,
              method: "GET",
              mode: "cors",
              headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": "Token " + token
              }
            };
          
            rp(options)
              .then(function (repos) {
                let res = JSON.parse(repos);
                let city = res.location.value;
                let country = res.location.data.country;
                bot.sendMessage(id, country + ', ' + city);
                console.log(repos);
              })
              .catch(function (err) {
                bot.sendMessage(id, 'Некорректный № IP, уточните запрос.');
                console.log(err);
              });
        
          } else if (section === '/bank by BIC') {
            let options = {
              uri: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank',
              method: "POST",
              mode: "cors",
              headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": "Token " + token
              },
              body: JSON.stringify({query: text})
            };
            
            rp(options)
                .then(function (repos) {
                  let res = JSON.parse(repos);
                  let name = res.suggestions[0].value + '\n';
                  let inn = 'ИНН: '  + res.suggestions[0].data.inn + '\n';
                  let ogrn = 'ОГРН: '  + res.suggestions[0].data.ogrn + '\n';
                  let address = 'адрес: '  + res.suggestions[0].data.address.value + '\n';
                  bot.sendMessage(id, name + inn + ogrn + address);
                })
                .catch(function (err) {
                  bot.sendMessage(id, 'Некорректный № БИК, уточните запрос.');
                  console.log(err);
                });
            } else if (section === '/search for affiliated companies') {
                if(/[а-яё]/i.test(text)) return bot.sendMessage(id, 'Некорректный № ИНН, уточните запрос.');
                if(text.length !== 10) return bot.sendMessage(id, 'ИНН должен содержать 10 цифр, уточните запрос.');
                var options = {
                    uri: "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + token
                    },
                    body: JSON.stringify({query: text})
                }
                rp(options)
                .then(function (repos) {
                    let res = JSON.parse(repos);
                    res["suggestions"].forEach((currentValue, index, array) => {
                        let name = currentValue.value + '\n';
                        let inn = 'ИНН: '  + currentValue.data.inn + '\n';
                        let address = 'адрес: '  + currentValue.data.address.value + '\n';
                        bot.sendMessage(id, name + inn + address);
                    })
                })
                .catch(function (err) {
                  bot.sendMessage(id, 'Некорректный № ИНН, уточните запрос.');
                  console.log(err);
                });
            } else if (section === '/invalid passport'){
                const secret = "98030bfdbcc357e4815654d01f975040224eace1";
                const options = {
                    uri: "https://cleaner.dadata.ru/api/v1/clean/passport",
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Token " + token,
                        "X-Secret": secret
                    },
                    body: JSON.stringify([text])
                }

                rp(options)
                .then(function (repos) {
                    let res = JSON.parse(repos);
                    if(res[0].qc === 0){
                        bot.sendMessage(id, 'Действующий паспорт.');
                    } else if (res[0].qc === 2){
                        bot.sendMessage(id, 'Сведений по данному паспорту нет.');
                    } else if (res[0].qc === 1){
                        bot.sendMessage(id, 'Неправильный формат серии или номера.');
                    } else if (res[0].qc === 10){
                        bot.sendMessage(id, 'Недействительный паспорт.');
                    }
                    console.log(res)
                })
                .catch(function (err) {
                  bot.sendMessage(id, 'Сервис временно недоступен.');
                  console.log(err);
                });
            }
    }
  }