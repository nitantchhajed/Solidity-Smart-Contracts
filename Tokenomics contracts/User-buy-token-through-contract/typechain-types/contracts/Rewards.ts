/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface RewardsInterface extends utils.Interface {
  functions: {
    "ADMIN_ROLE()": FunctionFragment;
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "addAdmins(address)": FunctionFragment;
    "endTime(uint256)": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "rewards(uint256)": FunctionFragment;
    "startTime(uint256)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "token()": FunctionFragment;
    "tokenamounts(uint256)": FunctionFragment;
    "transferOwnerShip(address)": FunctionFragment;
    "transferToken(uint256,address,uint256)": FunctionFragment;
    "userTokenBal(address,uint256)": FunctionFragment;
    "withdrawalToken(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ADMIN_ROLE"
      | "DEFAULT_ADMIN_ROLE"
      | "addAdmins"
      | "endTime"
      | "getRoleAdmin"
      | "grantRole"
      | "hasRole"
      | "owner"
      | "renounceRole"
      | "revokeRole"
      | "rewards"
      | "startTime"
      | "supportsInterface"
      | "token"
      | "tokenamounts"
      | "transferOwnerShip"
      | "transferToken"
      | "userTokenBal"
      | "withdrawalToken"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "addAdmins",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "endTime",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "rewards",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "startTime",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenamounts",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnerShip",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferToken",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "userTokenBal",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawalToken",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "ADMIN_ROLE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "addAdmins", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "endTime", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "rewards", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "startTime", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenamounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnerShip",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userTokenBal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawalToken",
    data: BytesLike
  ): Result;

  events: {
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "TransferOwnerShip(address,address)": EventFragment;
    "transferTokens(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TransferOwnerShip"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "transferTokens"): EventFragment;
}

export interface RoleAdminChangedEventObject {
  role: string;
  previousAdminRole: string;
  newAdminRole: string;
}
export type RoleAdminChangedEvent = TypedEvent<
  [string, string, string],
  RoleAdminChangedEventObject
>;

export type RoleAdminChangedEventFilter =
  TypedEventFilter<RoleAdminChangedEvent>;

export interface RoleGrantedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleGrantedEvent = TypedEvent<
  [string, string, string],
  RoleGrantedEventObject
>;

export type RoleGrantedEventFilter = TypedEventFilter<RoleGrantedEvent>;

export interface RoleRevokedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleRevokedEvent = TypedEvent<
  [string, string, string],
  RoleRevokedEventObject
>;

export type RoleRevokedEventFilter = TypedEventFilter<RoleRevokedEvent>;

export interface TransferOwnerShipEventObject {
  _oldOwner: string;
  _newOwner: string;
}
export type TransferOwnerShipEvent = TypedEvent<
  [string, string],
  TransferOwnerShipEventObject
>;

export type TransferOwnerShipEventFilter =
  TypedEventFilter<TransferOwnerShipEvent>;

export interface transferTokensEventObject {
  from: string;
  to: string;
  amount: BigNumber;
}
export type transferTokensEvent = TypedEvent<
  [string, string, BigNumber],
  transferTokensEventObject
>;

export type transferTokensEventFilter = TypedEventFilter<transferTokensEvent>;

export interface Rewards extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: RewardsInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    addAdmins(
      addAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    endTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rewards(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, BigNumber, boolean, boolean] & {
        rewardName: string;
        cliff: BigNumber;
        vested: BigNumber;
        startTime: BigNumber;
        endTime: BigNumber;
        isdistStart: boolean;
        isdistEnd: boolean;
      }
    >;

    startTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    token(overrides?: CallOverrides): Promise<[string]>;

    tokenamounts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        totalToken: BigNumber;
        unlockToken: BigNumber;
        remainToken: BigNumber;
        avgToken: BigNumber;
      }
    >;

    transferOwnerShip(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferToken(
      rewardId: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    userTokenBal(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    withdrawalToken(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  addAdmins(
    addAdmin: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  endTime(
    rewardId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(
    role: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  grantRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  hasRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rewards(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, BigNumber, boolean, boolean] & {
      rewardName: string;
      cliff: BigNumber;
      vested: BigNumber;
      startTime: BigNumber;
      endTime: BigNumber;
      isdistStart: boolean;
      isdistEnd: boolean;
    }
  >;

  startTime(
    rewardId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  token(overrides?: CallOverrides): Promise<string>;

  tokenamounts(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber] & {
      totalToken: BigNumber;
      unlockToken: BigNumber;
      remainToken: BigNumber;
      avgToken: BigNumber;
    }
  >;

  transferOwnerShip(
    _newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferToken(
    rewardId: PromiseOrValue<BigNumberish>,
    user: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  userTokenBal(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  withdrawalToken(
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    addAdmins(
      addAdmin: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    endTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    rewards(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, BigNumber, boolean, boolean] & {
        rewardName: string;
        cliff: BigNumber;
        vested: BigNumber;
        startTime: BigNumber;
        endTime: BigNumber;
        isdistStart: boolean;
        isdistEnd: boolean;
      }
    >;

    startTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    token(overrides?: CallOverrides): Promise<string>;

    tokenamounts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber] & {
        totalToken: BigNumber;
        unlockToken: BigNumber;
        remainToken: BigNumber;
        avgToken: BigNumber;
      }
    >;

    transferOwnerShip(
      _newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    transferToken(
      rewardId: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    userTokenBal(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdrawalToken(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "RoleAdminChanged(bytes32,bytes32,bytes32)"(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;
    RoleAdminChanged(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;

    "RoleGranted(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;
    RoleGranted(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;

    "RoleRevoked(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;
    RoleRevoked(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;

    "TransferOwnerShip(address,address)"(
      _oldOwner?: null,
      _newOwner?: null
    ): TransferOwnerShipEventFilter;
    TransferOwnerShip(
      _oldOwner?: null,
      _newOwner?: null
    ): TransferOwnerShipEventFilter;

    "transferTokens(address,address,uint256)"(
      from?: null,
      to?: null,
      amount?: null
    ): transferTokensEventFilter;
    transferTokens(
      from?: null,
      to?: null,
      amount?: null
    ): transferTokensEventFilter;
  };

  estimateGas: {
    ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    addAdmins(
      addAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    endTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rewards(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    startTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<BigNumber>;

    tokenamounts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    transferOwnerShip(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferToken(
      rewardId: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    userTokenBal(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdrawalToken(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ADMIN_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    addAdmins(
      addAdmin: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    endTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rewards(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    startTime(
      rewardId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    token(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenamounts(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferOwnerShip(
      _newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferToken(
      rewardId: PromiseOrValue<BigNumberish>,
      user: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    userTokenBal(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdrawalToken(
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
