// ============================================
// КОНФИГУРАЦИЯ FIREBASE
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBHC2AXp4AVCfUe7wClQTsaUMSc_gw4p2I",
  authDomain: "obucheniye-b4326.firebaseapp.com",
  databaseURL: "https://obucheniye-b4326-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "obucheniye-b4326",
  storageBucket: "obucheniye-b4326.firebasestorage.app",
  messagingSenderId: "449693708112",
  appId: "1:449693708112:web:23d8e1e3f8649b34034655"
};

// НЕ ИЗМЕНЯЙТЕ КОД НИЖЕ ЭТОЙ СТРОКИ
// ============================================

// Инициализация Firebase
let database;
let trainingDataRef;

function initFirebase() {
    // Проверяем, загружена ли библиотека Firebase
    if (typeof firebase === 'undefined') {
        console.error('Firebase не загружен! Добавьте скрипт Firebase в HTML.');
        return false;
    }
    
    try {
        // Инициализация Firebase
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        trainingDataRef = database.ref('trainingData');
        
        console.log('Firebase инициализирован!');
        return true;
    } catch (error) {
        console.error('Ошибка инициализации Firebase:', error);
        return false;
    }
}

// Загрузка данных из Firebase
function loadDataFromFirebase(callback) {
    if (!trainingDataRef) {
        console.error('Firebase не инициализирован');
        callback(null);
        return;
    }
    
    trainingDataRef.once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Преобразуем объект в массив
                const arrayData = Object.values(data);
                callback(arrayData);
            } else {
                callback(null);
            }
        })
        .catch((error) => {
            console.error('Ошибка загрузки данных:', error);
            callback(null);
        });
}

// Сохранение данных в Firebase
function saveDataToFirebase(data) {
    if (!trainingDataRef) {
        console.error('Firebase не инициализирован');
        return;
    }
    
    // Сохраняем как объект с ID в качестве ключей
    const dataObject = {};
    data.forEach(item => {
        dataObject[item.id] = item;
    });
    
    trainingDataRef.set(dataObject)
        .then(() => {
            console.log('Данные сохранены в Firebase');
        })
        .catch((error) => {
            console.error('Ошибка сохранения данных:', error);
        });
}

// Синхронизация в реальном времени (слушатель изменений)
function subscribeToDataChanges(callback) {
    if (!trainingDataRef) {
        console.error('Firebase не инициализирован');
        return;
    }
    
    trainingDataRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const arrayData = Object.values(data);
            callback(arrayData);
        } else {
            callback([]);
        }
    });
}

// Сохранение тренеров в Firebase
function saveTrainersToFirebase(trainersArray) {
    if (!database) return;
    
    database.ref('trainers').set(trainersArray)
        .catch((error) => {
            console.error('Ошибка сохранения тренеров:', error);
        });
}

// Загрузка тренеров из Firebase
function loadTrainersFromFirebase(callback) {
    if (!database) {
        callback(null);
        return;
    }
    
    database.ref('trainers').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            callback(data);
        })
        .catch((error) => {
            console.error('Ошибка загрузки тренеров:', error);
            callback(null);
        });
}
