const { 
    latestUpdateTime, 
    addExtremistMaterial, 
    updateTime, 
    addOrganizations
  } = require('../apiDatabase/api');
  const { parserDataExtremistMaterials } = require('../parsers/parserRSS');
  const { parserDataExtremistOrganizations, parserDataUnwantedOrganizations } = require('../parsers/parserHTML');

module.exports = (UPDATE_TIME) => {
    //проверка обновления базы экстремистских материалов -------------------------------------------------------------------------------------------------------
    const extremist_materials = latestUpdateTime('extremist_materials', UPDATE_TIME)
      .then(boolean=>{
        if(!boolean) return parserDataExtremistMaterials(); //получение материалов
        return Promise.reject('обновление базы extremist_materials не требуется');
      })
      .then(items => {
        if(!items) return false;
        return addExtremistMaterial(items); //добавление материалов в базу
      })
      .then(boolean => {
        if(boolean) updateTime('extremist_materials');
      })
      .catch(e => console.log(e))
    //проверка обновления базы экстремистских организаций -------------------------------------------------------------------------------------------------------
    const extremist_organizations = latestUpdateTime('extremist_organizations', UPDATE_TIME)
      .then(boolean=>{
        if(!boolean) return parserDataExtremistOrganizations(); //получение материалов
        return Promise.reject('обновление базы extremist_organizations не требуется');
      })
      .then(items => {
        return addOrganizations(items, 'extremist_organizations');
      })
      .then(boolean => {
        if(boolean) updateTime('extremist_organizations');
      })
      .catch(e => console.log(e))
    //проверка обновления базы нежелательных организаций -------------------------------------------------------------------------------------------------------
    const unwanted_organizations = latestUpdateTime('unwanted_organizations', UPDATE_TIME)
      .then(boolean=>{
        if(!boolean) return parserDataUnwantedOrganizations(); //получение материалов
        return Promise.reject('обновление базы unwanted_organizations не требуется');
      })
      .then(items => {
        return addOrganizations(items, 'unwanted_organizations');
      })
      .then(boolean => {
        if(boolean) updateTime('unwanted_organizations');
      })
      .catch(e => console.log(e));
    return Promise.all([extremist_materials, extremist_organizations, unwanted_organizations])
      .then(res => {
        console.log('Данные обновлены или не нуждаются в обнавлении.');
      })
      .catch(err => {
        console.log('checkUpdate: ' + err);
      });
}