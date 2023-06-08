import { ALGO_INPUT_FIELDS } from "../constants"

export interface IAlgorithmsSlice {
    configData: IInputParam[],
    fileData: IInputParam[],
    positionalData: IInputParam[],
    repoUrl: "",
    repoBranch: "",
    repoRunCommand: "",
    repoBuildCommand: "",
    algoName: "",
    algoDesc: "",
    algoDiskSpace: "",
    algoResource: any,
    algoContainer: "",
    inputId: number,
    registrationUrl: ""
  }

export interface IInputParam {
  [ALGO_INPUT_FIELDS.INPUT_NAME] : string,
  [ALGO_INPUT_FIELDS.INPUT_DEFAULT]: string,
  [ALGO_INPUT_FIELDS.INPUT_DESC]: string,
  [ALGO_INPUT_FIELDS.IS_REQUIRED]: boolean,
  [ALGO_INPUT_FIELDS.INPUT_ID]: number
}