import { getSecurity, setSecurity } from "services/securityService.js";

export let csrfSecurityEnabled = true;
export let xssSecurityEnabled = true;
export let clickjackingSecurityEnabled = true;
export let sqlInjectionSecurityEnabled = true;
export let commandInjectionSecurityEnabled = true;
export let pathTraversalSecurityEnabled = true;

export const setSecurities = async (req, res) => {
    const securityOptions = req.body.securityOptions;

    if (!Array.isArray(securityOptions)) {
        return res.status(400).json({ error: 'Invalid payload: securityOptions must be an array' });
    }

    try {
        for (const { name, isActive } of securityOptions) {
            await setSecurity(name, isActive);

            switch(name) {
                case 'csrf': csrfSecurityEnabled = !!isActive; break;
                case 'xss': xssSecurityEnabled = !!isActive; break;
                case 'clickjacking': clickjackingSecurityEnabled = !!isActive; break;
                case 'sql-injection': sqlInjectionSecurityEnabled = !!isActive; break;
                case 'command-injection': commandInjectionSecurityEnabled = !!isActive; break;
                case 'path-traversal': pathTraversalSecurityEnabled = !!isActive; break;
            }
        }

    return res.json(securityOptions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getSecurities = async (req, res) => {
    const securityOptions = await getSecurity();
    return res.json(securityOptions)
}

export const initEnabled = async () => {
    const securityOptions = await getSecurity();

    for (const { name, isActive } of securityOptions) {
        switch(name) {
            case 'csrf': csrfSecurityEnabled = !!isActive; break;
            case 'xss': xssSecurityEnabled = !!isActive; break;
            case 'clickjacking': clickjackingSecurityEnabled = !!isActive; break;
            case 'sql-injection': sqlInjectionSecurityEnabled = !!isActive; break;
            case 'command-injection': commandInjectionSecurityEnabled = !!isActive; break;
            case 'path-traversal': pathTraversalSecurityEnabled = !!isActive; break;
        }
    }

}

export const checkEnabled = (req, res) => {
    const enabledOptions = {
        csrfSecurityEnabled,
        xssSecurityEnabled,
        clickjackingSecurityEnabled,
        sqlInjectionSecurityEnabled,
        pathTraversalSecurityEnabled,
        commandInjectionSecurityEnabled
    }

    return res.json(enabledOptions) 
}