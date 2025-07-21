import config from "../config";

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
    claim_gem_from_valor = 'claim_gem_from_valor',
    revive = 'revive',
    
    claim_gem = 'claim_gem',

    claim_new_equipments = 'claim_new_equipments',
    claim_soul_piece_resources = 'claim_soul_piece_resources',
    upgrade_equipment = 'upgrade_equipment',
    reforge_equipment = 'reforge_equipment',
    merge_equipment = 'merge_equipment',
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

export const getActionAddress = (action: Action) => {
  if (action === Action.claim_gem) {
    return config().gemAddress;
  } else if (
    action === Action.claim_new_equipments ||
    action === Action.claim_soul_piece_resources ||
    action === Action.upgrade_equipment ||
    action === Action.reforge_equipment ||
    action === Action.merge_equipment
    ) {
    return config().itemContractAddress;
  } else return config().actionAddress;
};