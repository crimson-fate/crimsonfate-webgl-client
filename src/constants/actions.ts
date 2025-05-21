export enum Action {
    request_random = 'request_random',
    start_new_game = 'start_new_game',
    receive_skill = 'receive_skill',
    select_skill = 'select_skill',
    receive_angel_or_evil = 'receive_angel_or_evil',
    accept_or_ignore_evil_skill = 'accept_or_ignore_evil_skill',
    update_prover = 'update_prover',
    request_valor = 'request_valor',
    bribe_valor = 'bribe_valor',
    claim_chest = 'claim_chest',
    open_chest = 'open_chest',
};

export const Callback = {
    object: 'JSInteropManager',
    method: 'Callback',
};

// map from action to callback
export const actionConfig = {
    [Action.request_random]: {
        waitForTx: false,
    },
    [Action.receive_skill]: {
        waitForTx: true,
    },
};