type LoginResponse = {
    token: string;
    user: {
        id: number;
        username: string;
        description?: string;
    };
};
