import { getSecurity, setSecurity } from "services/securityService.js";

export let csrfEnabled = false;
export let xssEnabled = false;
export let clickjackingEnabled = false;
export let sqlInjectionEnabled = false;
export let commandInjectionEnabled = false;
export let pathTraversalEnabled = false;



export const setSecurities = async (req, res) => {
    const securityOptions = req.body.securityOptions;

    if (!Array.isArray(securityOptions)) {
        return res.status(400).json({ error: 'Invalid payload: securityOptions must be an array' });
    }

    try {
        for (const { name, isActive } of securityOptions) {
            await setSecurity(name, isActive);

            switch(name) {
                case 'csrf': csrfEnabled = !!isActive; break;
                case 'xss': xssEnabled = !!isActive; break;
                case 'clickjacking': clickjackingEnabled = !!isActive; break;
                case 'sql-injection': sqlInjectionEnabled = !!isActive; break;
                case 'command-injection': commandInjectionEnabled = !!isActive; break;
                case 'path-traversal': pathTraversalEnabled = !!isActive; break;
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
            case 'csrf': csrfEnabled = !!isActive; break;
            case 'xss': xssEnabled = !!isActive; break;
            case 'clickjacking': clickjackingEnabled = !!isActive; break;
            case 'sql-injection': sqlInjectionEnabled = !!isActive; break;
            case 'command-injection': commandInjectionEnabled = !!isActive; break;
            case 'path-traversal': pathTraversalEnabled = !!isActive; break;
        }
    }

}

export const checkEnabled = (req, res) => {
    const enabledOptions = {
        csrfEnabled,
        xssEnabled,
        clickjackingEnabled,
        sqlInjectionEnabled,
        pathTraversalEnabled,
        commandInjectionEnabled
    }

    return res.json(enabledOptions) 
}