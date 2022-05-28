declare type PrivateDummy = {
    type: 'dummy';
};
export declare type Dummy = {
    type: 'dummy';
    private: PrivateDummy;
};
export declare const dummy: Dummy;
export declare const privateDummy: PrivateDummy;
export {};
