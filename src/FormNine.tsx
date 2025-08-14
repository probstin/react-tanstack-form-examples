import { EXCLUDED_STEPS } from "./actions.config"
import ActionsButtons from "./ActionsButtons"
import ActionsMenu from "./ActionsMenu"

function FormNine() {
    return <>
        <ActionsButtons status={'DRAFT'} nextSteps={['ADVERTISED']} excludedSteps={EXCLUDED_STEPS} />
        <ActionsMenu status={'DRAFT'} nextSteps={['ADVERTISED']} />
    </>

}

export default FormNine