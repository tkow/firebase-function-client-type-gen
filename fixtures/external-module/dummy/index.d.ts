declare type PrivateDummy = {
    type: 'dummy';
};
export interface IDummy {
    type: 'idummy';
}
export declare type Dummy = {
    type: 'dummy';
    private: PrivateDummy;
    interface: IDummy;
};
export declare type DummyIgnored = {
    type: 'dummy';
    private: PrivateDummy;
    interface: IDummy;
};
export declare const dummy: Dummy;
export declare const privateDummy: PrivateDummy;
export {};
