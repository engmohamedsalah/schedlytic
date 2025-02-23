export const PasswordChecklist = (props) => {
    let myRules = [];
    let isVerified = true;
    props.rules.map((d , i) => {
        let actCls = '';
        if(d == 'minLength'){
            actCls = props.value.length > props.minLength?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password has more than {props.minLength} characters.</a></li>)
        }

        if(d == 'specialChar'){
            actCls = /(?=.*[!@#$%^&*()_+{}:"<>?\|\[\];\',./`~])/.test(props.value)?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password has special characters.</a></li>)
        }

        if(d == 'number'){
            actCls = /\d/.test(props.value)?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password has a number.</a></li>)
        }

        if(d == 'capital'){
            actCls = /(?=.*[A-Z])/.test(props.value) ?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password has a capital letter.</a></li>)
        }

        if(d == 'small'){
            actCls = /(?=.*[a-z])/.test(props.value) ?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password has a small letter.</a></li>)
        }

        if(d == 'match'){
            actCls = props.value == props.value2 && props.value.length?'active':'in-active';
            myRules.push(<li key={i}> <a className={actCls}>Password match.</a></li>)
        }

        if(actCls == 'in-active'){
            isVerified = false;
        }

    });

    if(props.onChange){
        props.onChange(isVerified)
    }


    return (
        <ul>{myRules}</ul>
    );
}