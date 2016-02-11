import * as appModule from "application";
import {FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken} from "./firebase-common";
import * as types from "utils/types";

declare var FEventType: any;

var IosFirebaseClass: any = Firebase;

export class IosFirebaseDataSnapshot implements IFirebaseDataSnapshot {
    private _snap: any;

    constructor(snap) {
        this._snap = snap;
    }

    public val(): any {
        return IosFirebase.toJsObject(this._snap.value);
    }

    public key(): string {
        return this._snap.key;
    }
}

export class IosFirebase extends FirebaseCommon implements IFirebase {

    constructor(instance: any) {
        super(instance);
    }

    public static toJsObject(objCObj) {
        if (objCObj === null || typeof objCObj != "object") {
            return objCObj;
        }
        var node, key, i, l,
            oKeyArr = objCObj.allKeys;

        if (oKeyArr === undefined) {
            // array
            node = [];
            for (i = 0, l = objCObj.count; i < l; i++) {
                key = objCObj.objectAtIndex(i);
                node.push(IosFirebase.toJsObject(key));
            }
        } else {
            // object
            node = {};
            for (i = 0, l = oKeyArr.count; i < l; i++) {
                key = oKeyArr.objectAtIndex(i);
                var val = objCObj.valueForKey(key);

                switch (types.getClass(val)) {
                    case 'NSMutableArray':
                        node[key] = IosFirebase.toJsObject(val);
                        break;
                    case 'NSMutableDictionary':
                        node[key] = IosFirebase.toJsObject(val);
                        break;
                    case 'String':
                        node[key] = String(val);
                        break;
                    case 'Boolean':
                        node[key] = Boolean(String(val));
                        break;
                    case 'Number':
                        node[key] = Number(String(val));
                        break;
                }
            }
        }
        return node;
    }

    public static getCallbackData(snapshot): IFirebaseDataSnapshot {
        return new IosFirebaseDataSnapshot(snapshot);
    };

    public static init(arg: any) {
        return new Promise(function(resolve, reject) {
            try {
                var instance = new IosFirebaseClass(arg.url);
                resolve(instance);
            } catch (ex) {
                console.log("Error in firebase.init: " + ex);
                reject(ex);
            }
        });
    }

    public login(arg) {
        return new Promise(function(resolve, reject) {
            try {
                var onCompletion = function(error, authData) {
                    if (error) {
                        reject(error.localizedDescription);
                    } else {
                        resolve({
                            uid: authData.uid,
                            provider: authData.provider,
                            expiresAtUnixEpochSeconds: authData.expires,
                            profileImageURL: authData.providerData.objectForKey("profileImageURL"),
                            token: authData.token
                        });
                    }
                };

                var type = arg.type;
                if (type === FirebaseCommon.LoginType.ANONYMOUS) {
                    this.instance.authAnonymouslyWithCompletionBlock(onCompletion);
                } else if (type === FirebaseCommon.LoginType.PASSWORD) {
                    if (!arg.email || !arg.password) {
                        reject("Auth type emailandpassword requires an email and password argument");
                    } else {
                        this.instance.authUserPasswordWithCompletionBlock(arg.email, arg.password, onCompletion);
                    }
                } else {
                    reject("Unsupported auth type: " + type);
                }
            } catch (ex) {
                console.log("Error in firebase.login: " + ex);
                reject(ex);
            }
        });
    }

    public createUser(arg) {
        return new Promise(function(resolve, reject) {
            try {
                var onCompletion = function(error, authData) {
                    if (error) {
                        reject(error.localizedDescription);
                    } else {
                        resolve(IosFirebase.toJsObject(authData).uid);
                    }
                };

                if (!arg.email || !arg.password) {
                    reject("Creating a user requires an email and password argument");
                } else {
                    this.instance.createUserPasswordWithValueCompletionBlock(arg.email, arg.password, onCompletion);
                }
            } catch (ex) {
                console.log("Error in firebase.createUser: " + ex);
                reject(ex);
            }
        });
    }

    public push(data: any): Promise<boolean> {
        return new IosFirebase(this.instance.childByAutoId()).set(data);
    }

    public set(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.instance.setValueWithCompletionBlock(data, (err: any, ref: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    public child(path: string): IFirebase {
        return new IosFirebase(this.instance.childByAppendingPath(path));
    }

    public on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken {
        var eventType: any;

        switch (eventName) {
            case "value":
                eventType = FEventType.FEventTypeValue;
                break;
            case "child_added":
                eventType = FEventType.FEventTypeChildAdded;
                break;
            case "child_removed":
                eventType = FEventType.FEventTypeChildRemoved;
                break;
            case "child_changed":
                eventType = FEventType.FEventTypeChildChanged;
                break;
            case "child_moved":
                eventType = FEventType.FEventTypeChildMoved;
                break;
        }

        return this.instance.observeEventTypeWithBlockWithCancelBlock(
            eventType,
            (snap: any) => {
                callback(IosFirebase.getCallbackData(snap));
            },
            (err: any) => {
                if(errorCallback) {
                    errorCallback(err);
                }
            }
        );
    }

    public off(token: IFirebaseEventToken): void {
        this.instance.removeObserverWithHandle(token);
    }

    public setValue(path, val) {
        return new Promise(function(resolve, reject) {
            try {
                this.instance.childByAppendingPath(path).setValue(val);
                resolve();
            } catch (ex) {
                console.log("Error in firebase.setValue: " + ex);
                reject(ex);
            }
        });
    }

    public query(updateCallback, path, options) {
        return new Promise(function(resolve, reject) {
            try {

                var where = this.instance;
                if (path !== undefined) {
                    where = this.instance.childByAppendingPath(path);
                }

                var query;
      
                // orderBy
                if (options.orderBy.type === FirebaseCommon.QueryOrderByType.KEY) {
                    query = where.queryOrderedByKey();
                } else if (options.orderBy.type === FirebaseCommon.QueryOrderByType.VALUE) {
                    query = where.queryOrderedByValue();
                } else if (options.orderBy.type === FirebaseCommon.QueryOrderByType.PRIORITY) {
                    query = where.queryOrderedByPriority();
                } else if (options.orderBy.type === FirebaseCommon.QueryOrderByType.CHILD) {
                    if (!options.orderBy.value) {
                        reject("When orderBy.type is 'child' you must set orderBy.value as well.");
                        return;
                    }
                    query = where.queryOrderedByChild(options.orderBy.value);
                } else {
                    reject("Invalid orderBy.type, use constants like firebase.QueryOrderByType.VALUE");
                    return;
                }

                // range
                if (options.range && options.range.type) {
                    if (!options.range.value) {
                        reject("Please set range.value");
                        return;
                    }
                    if (options.range.type === FirebaseCommon.QueryRangeType.START_AT) {
                        query = query.queryStartingAtValue(options.range.value);
                    } else if (options.range.type === FirebaseCommon.QueryRangeType.END_AT) {
                        console.log("----- ending at: " + options.range.value);
                        query = query.queryEndingAtValue(options.range.value);
                    } else if (options.range.type === FirebaseCommon.QueryRangeType.EQUAL_TO) {
                        query = query.queryEqualToValue(options.range.value);
                    } else {
                        reject("Invalid range.type, use constants like firebase.QueryRangeType.START_AT");
                        return;
                    }
                }

                // limit
                if (options.limit && options.limit.type) {
                    if (!options.limit.value) {
                        reject("Please set limit.value");
                        return;
                    }
                    if (options.limit.type === FirebaseCommon.QueryLimitType.FIRST) {
                        query = query.queryLimitedToFirst(options.limit.value);
                    } else if (options.limit.type === FirebaseCommon.QueryLimitType.LAST) {
                        console.log("---- LAST");
                        query = query.queryLimitedToLast(options.limit.value);
                    } else {
                        reject("Invalid limit.type, use constants like firebase.queryOptions.limitType.FIRST");
                        return;
                    }
                }

                //IosFirebase._addObservers(query, updateCallback);
                resolve();
            } catch (ex) {
                console.log("Error in firebase.query: " + ex);
                reject(ex);
            }
        });
    }

    public remove(path) {
        return new Promise(function(resolve, reject) {
            try {
                this.instance.childByAppendingPath(path).setValue(null);
                resolve();
            } catch (ex) {
                console.log("Error in firebase.remove: " + ex);
                reject(ex);
            }
        });
    }
}

export var Firebase = IosFirebase;