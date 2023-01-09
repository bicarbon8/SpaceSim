import { Engine } from "../ships/attachments/utility/engine"

export type HasEngine = {
    getThruster(): Engine
}