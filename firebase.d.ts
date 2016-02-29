/// <reference path="firebase-common.d.ts" />
declare module "nativescript-plugin-firebase-common" {
    /**
 * Defines an interface that represents objects that contain firebase authentication data.
 */
export interface IFirebaseAuthData {
    /**
     * The UID of the user.
     */
    uid: string;
    
    /**
     * The provider that the user used to authenticate.
     */
    provider: string;
    
    /**
     * The authentication token payload.
     */
    auth: any;
    
    /**
     * The expiration time of the token in seconds since the Unix epoch.
     */
    expires: number;
}

/**
 * Defines an interface that specifies what capabilities a firebase data snapshot has.
 */
export interface IFirebaseDataSnapshot {
    /**
     * Gets the data value from this snapshot.
     */
    val(): any;
    
    /**
     * Gets the key that this snapshot represents.
     */
    key(): string;
}

/**
 * Defines an interface that specifies what a standarized firebase instance looks like.
 */
export interface IFirebase {
    /**
     * Listens for events with the given name.
     */
    on(eventName: string, callback: Function, errCallback: (err: any) => void): IFirebaseEventToken;
    
    /**
     * Stops listening for the event that the given token subscribes to.
     */
    off(eventType: string, token: IFirebaseEventToken): void;
    
    /**
     * Returns a new firebase instance that represents the given path beneath this firebase instance.
     */
    child(path: string): IFirebase;
    
    /**
     * Removes the child with the given key. If the key is not provided, this location is removed from its parent.
     */
    remove(key?:string): Promise<boolean>;
    
    /**
     * Adds the given data to this firebase location.
     */
    push(data: any): Promise<boolean>;
    
    /**
     * Sets the data at this firebase location.
     */
    set(data: any): Promise<boolean>;
        
    /**
     * Authenticates a firebase client to the given provider using the given OAuth token.
     * @param provider String The unique string identifying the OAuth provider to authenticate with, e.g. `google`.
     * @param token String The OAuth token.
     */
    authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Authenticates a firebase client using the given username and password.
     * @param email String The email address of the user.
     * @param password String The password to use for authentication.
     */
    authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Authenticates the firebase client using the given custom token.
     * @param token String The custom token to use for authentication.
     * @param onComplete Function A function that is called when the operation is complete.
     */
    authWithCustomToken(token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Unauthenticates the firebase client.
     */
    unauth(): Promise<boolean>;
    
    /**
     * Retrieves the current authentication data from the client.
     */
    getAuth(): IFirebaseAuthData;
}
    /**
     * Defines a class that represents a token that
     * represents a subscription to a Firebase event.
     */
    export interface IFirebaseEventToken {
    }
    export class FirebaseCommon {
        constructor(instance: any);
        static LoginType: {
            ANONYMOUS: string;
            PASSWORD: string;
        };
        static QueryOrderByType: {
            KEY: string;
            VALUE: string;
            CHILD: string;
            PRIORITY: string;
        };
        static QueryLimitType: {
            FIRST: string;
            LAST: string;
        };
        static QueryRangeType: {
            START_AT: string;
            END_AT: string;
            EQUAL_TO: string;
        };
        protected instance: any;
        logout(arg: any): any;
    }

    export class AndroidFirebaseDataSnapshot implements IFirebaseDataSnapshot {
        private _snap;
        constructor(snap: any);
        val(): any;
        key(): string;
    }
    export class Firebase extends FirebaseCommon implements IFirebase {
        constructor(instance: any);
        static toHashMap(obj: any): any;
        static toJsObject(javaObj: any): any;
        static getCallbackData(snapshot: any): IFirebaseDataSnapshot;
        static createNew(arg: {
            url: string;
        }): IFirebase;
        login(arg: any): Promise<{}>;
        createUser(arg: any): Promise<any>;
        push(data: any): Promise<boolean>;
        setValue(path: any, val: any): Promise<{}>;
        query(updateCallback: any, path: any, options: any): Promise<{}>;
        remove(key?: string): Promise<boolean>;
        on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken;
        off(eventName: string, token: IFirebaseEventToken): void;
        set(data: any): Promise<boolean>;
        child(path: string): IFirebase;
        authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
        authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData>;
        authWithCustomToken(token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
        unauth(): Promise<boolean>;
        getAuth(): IFirebaseAuthData;
    }
}