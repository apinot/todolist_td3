import Vue from 'nativescript-vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import SQLite from 'nativescript-sqlite';
import { clipPathProperty } from 'tns-core-modules/ui/frame/frame';

const store = new Vuex.Store({
    state: {
        database: null,
        todoItems: [],
        // todoItems: groceryData.groceryItems.sort((a, b) => b.id - a.id),
    },
    getters: {
        todoItems(state) {
            return state.todoItems;
        }
    },
    mutations: {
        init(state, data) {
            state.database = data.database;
            state.todoItems = data.todoItems
        },
        insert(state, data) {
            state.todoItems.unshift(data.todoItem);
        }
    },
    actions: {
        init(context) {
            (new SQLite('todolist.db'))
            .then((db) => {
                //create db
                db.execSQL("CREATE TABLE IF NOT EXISTS todoitems (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, done TEXT)")
                .then(id => {

                    //get data
                    if(!db) return;
                    db.all('SELECT * FROM todoitems', [])
                    .then((result) => {
                       const mapedItems = result.map((item) => {
                           return {id: item[0], name: item[1], done: item[2] === 'true'}
                       });
                       context.commit('init', {database: db, todoItems: mapedItems});
                    })
                    .catch(() => {
                        console.log('CANNOT INSERT TODO ELEMENT IN DB');
                    });
                })
                .catch(() => {
                    console.log('CANNOT CREATE TABLE');
                })
            })
            .catch(() => {
                console.log('CANNOT OPEN DATABASE');
            });
        },
        insert(context, item) {
            const db = context.state.database;
            db.execSQL("INSERT INTO todoitems(name, done) VALUES (?,?)", [item.name, 'false'])
            .then((id) => {
                const newItem = {
                    id: id,
                    name: item.name,
                    done: false,
                }

                context.commit('insert', {todoItem: newItem});
            })
            .catch(() => {
                console.log('CANNOT INSERT TODO ITEM IN DB', error);
            })
        }
    },
});


// init db
store.dispatch('init');

export default store;