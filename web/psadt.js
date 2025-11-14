const imageUploadInput = document.getElementById('imageUploadInput');
const psadtModal = document.getElementById('psadtModal');
const modalCloseButton = document.getElementById('modalCloseButton');
const createPackageButton = document.getElementById('createPackageButton');
const cancelButton = document.getElementById('cancelButton');
const packageLocationInput = document.getElementById('packageLocation');
const browseButton = document.querySelector('.browse-button');

const packageWrapperWindow = document.getElementById('packageWrapperWindow');
const packageWrapperHeader = document.getElementById('packageWrapperHeader');
const packageWrapperCloseButton = document.getElementById('packageWrapperCloseButton');
const packageAppearanceSection = document.getElementById('packageAppearanceSection');
const editBannerButton = document.getElementById('editBannerButton');
const editIconButton = document.getElementById('editIconButton');
const editLogoButton = document.getElementById('editLogoButton');
const packageEditButton = document.getElementById('packageEditButton');
const packageSaveButton = document.getElementById('packageSaveButton');
const packageCancelButton = document.getElementById('packageCancelButton');
const packageIdentityGrid = document.getElementById('packageIdentityGrid');
const packageIdentityInputs = document.querySelectorAll('.package-field-input');

// Designer Elements
const designerTree = document.querySelector('.designer-tree');
const fileExplorerView = document.getElementById('fileExplorerView');
const codeEditorView = document.getElementById('codeEditorView');
const designerContentTitle = document.getElementById('designerContentTitle');
const codeEditorTitle = document.getElementById('codeEditorTitle');
const fileListBody = document.getElementById('fileListBody');
const addFileBtn = document.getElementById('addFileBtn');
const addFileOptionsBtn = document.getElementById('addFileOptionsBtn');
const deleteFileBtn = document.getElementById('deleteFileBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const importSection = document.getElementById('importSection');

// Editor Footer Buttons
const addCodeBtn = document.getElementById('addCodeBtn');
const recentBtn = document.getElementById('recentBtn');
const helpBtn = document.getElementById('helpBtn');

// --- CodeMirror Instance ---
let editor;

// --- State ---
const psadtState = {
    isEditing: false,
    originalValues: {},
    currentImageType: null 
};

// Example appState object for modal state tracking
const appState = {
    modalOpen: false,
    packageWrapperOpen: false
};

// Modal open logic (if needed)
export function openPSADTModal() {
    appState.modalOpen = true;
    psadtModal.classList.remove('hidden');
    const now = new Date();
    const timestamp = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') + '-' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
    packageLocationInput.value = `C:\\PKG\\PKG-${timestamp}`;
    document.body.style.overflow = 'hidden';
    console.log('PSAppDeployToolkit modal opened');
}

function closePSADTModal() {
    appState.modalOpen = false;
    psadtModal.classList.add('hidden');
    document.body.style.overflow = '';
    console.log('PSAppDeployToolkit modal closed');
}

function handleCreatePackage() {
    console.log('Creating PSAppDeployToolkit package:', {
        template: document.getElementById('templateSelect').value,
        location: packageLocationInput.value
    });
    closePSADTModal();
    openPackageWrapperWindow();
}

// --- Package Wrapper Functions ---
function openPackageWrapperWindow() {
    appState.packageWrapperOpen = true;
    packageWrapperWindow.classList.remove('hidden');
    const packageName = packageLocationInput.value.split('\\').pop();
    packageWrapperWindow.querySelector('.package-wrapper-title').textContent = `Package Wrapper - ${packageName}`;
    document.body.style.overflow = 'hidden';
    console.log('Package Wrapper window opened');
    // Initialize CodeMirror here, after the modal is visible
    if (!editor) {
        try {
            editor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
                lineNumbers: true,
                mode: 'powershell',
                theme: 'dracula',
                lineWrapping: true,
                value: fullScriptContent
            });
        } catch (e) {
            console.error("CodeMirror failed to initialize.", e);
        }
    }
}

function closePackageWrapperWindow() {
    if (psadtState.isEditing) {
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            handlePackageCancel();
        } else {
            return;
        }
    }
    appState.packageWrapperOpen = false;
    packageWrapperWindow.classList.add('hidden');
    document.body.style.overflow = '';
    console.log('Package Wrapper window closed');
}

// --- Edit Mode Functions ---
function handlePackageEdit() {
    psadtState.isEditing = true;
    packageIdentityInputs.forEach(input => {
        psadtState.originalValues[input.id] = input.value;
    });
    packageAppearanceSection.classList.add('edit-mode');
    packageCancelButton.classList.remove('hidden');
    packageIdentityInputs.forEach(input => input.readOnly = false);
    document.getElementById('pkg-name').focus();
    console.log('Package edit mode enabled');
}

function handlePackageSave() {
    console.log('Saving package identity...');
    finishEditing();
    console.log('Package edit mode disabled, changes saved.');
}

function handlePackageCancel() {
    packageIdentityInputs.forEach(input => {
        input.value = psadtState.originalValues[input.id];
    });
    finishEditing();
    console.log('Package edit mode disabled, changes canceled.');
}

function finishEditing() {
    psadtState.isEditing = false;
    packageAppearanceSection.classList.remove('edit-mode');
    packageIdentityGrid.classList.remove('edit-mode');
    packageEditButton.classList.remove('hidden');
    packageSaveButton.classList.add('hidden');
    packageCancelButton.classList.add('hidden');
    packageIdentityInputs.forEach(input => input.readOnly = true);
}

function handleImageEdit(type) {
    if (!psadtState.isEditing) return;
    psadtState.currentImageType = type;
    imageUploadInput.click();
}

function onImageSelected(event) {
    const file = event.target.files[0];
    if (file && psadtState.currentImageType) {
        console.log(`Selected ${psadtState.currentImageType}: ${file.name}`);
        alert(`Selected file for ${psadtState.currentImageType}: ${file.name}\n(Preview not implemented)`);
    }
    event.target.value = '';
    psadtState.currentImageType = null;
}

// --- Draggable Window ---
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// --- Package Tab Functions ---
function switchPackageTab(tabId) {
    document.querySelectorAll('.package-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.packageTab === tabId);
    });
    document.querySelectorAll('.package-tab-content').forEach(content => {
        content.classList.toggle('hidden', content.id !== `${tabId}Tab`);
    });
}

// --- Designer Functions ---
function handleDesignerNavigation(element) {
    document.querySelectorAll('.tree-item.active').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    const view = element.dataset.view;
    const title = element.querySelector('span').textContent;

    if (view === 'explorer') {
        fileExplorerView.classList.remove('hidden');
        codeEditorView.classList.add('hidden');
        designerContentTitle.textContent = title;
    } else if (view === 'editor') {
        fileExplorerView.classList.add('hidden');
        codeEditorView.classList.remove('hidden');
        codeEditorTitle.textContent = title;
        if (editor) {
            editor.setValue(fullScriptContent);
            editor.refresh();
        }
    }
}

// --- Event Listeners ---
function initializePsadtEventListeners() {
    if (modalCloseButton) modalCloseButton.addEventListener('click', closePSADTModal);
    if (cancelButton) cancelButton.addEventListener('click', closePSADTModal);
    if (createPackageButton) createPackageButton.addEventListener('click', handleCreatePackage);
    if (packageWrapperCloseButton) packageWrapperCloseButton.addEventListener('click', closePackageWrapperWindow);
    if (packageEditButton) packageEditButton.addEventListener('click', handlePackageEdit);
    if (packageSaveButton) packageSaveButton.addEventListener('click', handlePackageSave);
    if (packageCancelButton) packageCancelButton.addEventListener('click', handlePackageCancel);
    if (editBannerButton) editBannerButton.addEventListener('click', () => handleImageEdit('banner'));
    if (editIconButton) editIconButton.addEventListener('click', () => handleImageEdit('icon'));
    if (editLogoButton) editLogoButton.addEventListener('click', () => handleImageEdit('logo'));
    if (imageUploadInput) imageUploadInput.addEventListener('change', onImageSelected);

    document.querySelectorAll('.package-tab').forEach(tab => {
        tab.addEventListener('click', () => switchPackageTab(tab.dataset.packageTab));
    });

    document.querySelectorAll('.designer-tree .tree-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Stop propagation to prevent parent handlers from firing
            e.stopPropagation(); 
            handleDesignerNavigation(item);
        });
    });

    // Draggable functionality
    if (packageWrapperWindow && packageWrapperHeader) {
        makeDraggable(packageWrapperWindow, packageWrapperHeader);
    }
}

// --- Initialization ---
initializePsadtEventListeners();


// Store the PowerShell script for use in the editor or elsewhere
const fullScriptContent = `
<#
.SYNOPSIS

PSApppDeployToolkit - This script performs the installation or uninstallation of an application(s).

.DESCRIPTION

- The script is provided as a template to perform an install or uninstall of an application(s).
- The script either performs an "Install" deployment type or an "Uninstall" deployment type.
- The install deployment type is broken down into 3 main sections/phases: Pre-Install, Install, and Post-Install.

The script dot-sources the AppDeployToolkitMain.ps1 script which contains the logic and functions required to install or uninstall an application.

PSApppDeployToolkit is licensed under the GNU LGPLv3 License - (C) 2024 PSAppDeployToolkit Team (Sean Lillis, Dan Cunningham and Muhammad Mashwani).

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU Lesser General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

.PARAMETER DeploymentType

The type of deployment to perform. Default is: Install.

.PARAMETER DeployMode

Specifies whether the installation should be run in Interactive, Silent, or NonInteractive mode. Default is: Interactive. Options: Interactive = Shows dialogs, Silent = No dialogs, NonInteractive = Very silent, i.e. no blocking apps. NonInteractive mode is automatically set if it is detected that the process is not user interactive.

.PARAMETER AllowRebootPassThru

Allows the 3010 return code (requires restart) to be passed back to the parent process (e.g. SCCM) if detected from an installation. If 3010 is passed back to SCCM, a reboot prompt will be triggered.

.PARAMETER TerminalServerMode

Changes to "user install mode" and back to "user execute mode" for installing/uninstalling applications for Remote Desktop Session Hosts/Citrix servers.

.PARAMETER DisableLogging

Disables logging to file for the script. Default is: $false.

.EXAMPLE

powershell.exe -Command "& { & '.\\Deploy-Application.ps1' -DeployMode 'Silent'; Exit $LastExitCode }"

.EXAMPLE

powershell.exe -Command "& { & '.\\Deploy-Application.ps1' -AllowRebootPassThru; Exit $LastExitCode }"

.EXAMPLE

powershell.exe -Command "& { & '.\\Deploy-Application.ps1' -DeploymentType 'Uninstall'; Exit $LastExitCode }"

.EXAMPLE

Deploy-Application.exe -DeploymentType "Install" -DeployMode "Silent"

.INPUTS

None

You cannot pipe objects to this script.

.OUTPUTS

None

This script does not generate any output.

.NOTES

Toolkit Exit Code Ranges:
- 60000 - 68999: Reserved for built-in exit codes in Deploy-Application.ps1, Deploy-Application.exe, and AppDeployToolkitMain.ps1
- 69000 - 69999: Recommended for user customized exit codes in Deploy-Application.ps1
- 70000 - 79999: Recommended for user customized exit codes in AppDeployToolkitExtensions.ps1

.LINK

https://psappdeploytoolkit.com
#>

[CmdletBinding()]
Param (
    [Parameter(Mandatory = $false)]
    [ValidateSet('Install', 'Uninstall', 'Repair')]
    [String]$DeploymentType = 'Install',
    [Parameter(Mandatory = $false)]
    [ValidateSet('Interactive', 'Silent', 'NonInteractive')]
    [String]$DeployMode = 'Interactive',
    [Parameter(Mandatory = $false)]
    [switch]$AllowRebootPassThru = $false,
    [Parameter(Mandatory = $false)]
    [switch]$TerminalServerMode = $false,
    [Parameter(Mandatory = $false)]
    [switch]$DisableLogging = $false
)

Try {
    ## Set the script execution policy for this process
    Try {
        Set-ExecutionPolicy -ExecutionPolicy 'ByPass' -Scope 'Process' -Force -ErrorAction 'Stop'
    } Catch {
    }

    ##*===============================================
    #region VARIABLE DECLARATION
    ##*===============================================
    ## Variables: Application
    [String]$appVendor = ''
    [String]$appName = ''
    [String]$appVersion = ''
    [String]$appArch = ''
    [String]$appLang = 'EN'
    [String]$appRevision = '01'
    [String]$appScriptVersion = '1.0.0'
    [String]$appScriptDate = 'XX/XX/20XX'
    [String]$appScriptAuthor = '<author name>'
    ##*===============================================
    ## Variables: Install Titles (Only set here to override defaults set by the toolkit)
    [String]$installName = ''
    [String]$installTitle = ''

    ##* Do not modify section below
    #region DoNotModify

    ## Variables: Exit Code
    [Int32]$mainExitCode = 0

    ## Variables: Script
    [String]$deployAppScriptFriendlyName = 'Deploy Application'
    [Version]$deployAppScriptVersion = [Version]'3.10.2'
    [String]$deployAppScriptDate = '08/13/2024'
    [Hashtable]$deployAppScriptParameters = $PsBoundParameters

    ## Variables: Environment
    If (Test-Path -LiteralPath 'variable:HostInvocation') {
        $InvocationInfo = $HostInvocation
    }
    [String]$scriptDirectory = Split-Path -Path $InvocationInfo.MyCommand.Definition -Parent

    ## Dot source the required App Deploy Toolkit Functions
    Try {
        [String]$moduleAppDeployToolkitMain = "$scriptDirectory\\AppDeployToolkit\\AppDeployToolkitMain.ps1"
        If (-not (Test-Path -LiteralPath $moduleAppDeployToolkitMain -PathType 'Leaf')) {
            Throw "Module does not exist at the specified location [$moduleAppDeployToolkitMain]."
        }
        If ($DisableLogging) {
            . $moduleAppDeployToolkitMain -DisableLogging
        }
        Else {
            . $moduleAppDeployToolkitMain
        }
    }
    Catch {
        If ($mainExitCode -eq 0) {
            [Int32]$mainExitCode = 60008
        }
         Write-Error -Message "Module [$moduleAppDeployToolkitMain] failed to load:       │
 │        \`n\$($_.Exception.Message)\`n \`n\$($_.InvocationInfo.PositionMessage)" -ErrorAction      │
 │        'Continue'
        ## Exit the script, returning the exit code to SCCM
        If (Test-Path -LiteralPath 'variable:HostInvocation') {
            $script:ExitCode = $mainExitCode; Exit
        }
        Else {
            Exit $mainExitCode
        }
    }

    #endregion
    ##* Do not modify section above
    ##*===============================================
    #endregion END VARIABLE DECLARATION
    ##*===============================================

    If ($deploymentType -ine 'Uninstall' -and $deploymentType -ine 'Repair') {
        ##*===============================================
        ##* MARK: PRE-INSTALLATION
        ##*===============================================
        [String]$installPhase = 'Pre-Installation'

        ## Show Welcome Message, close Internet Explorer if required, allow up to 3 deferrals, verify there is enough disk space to complete the install, and persist the prompt
        Show-InstallationWelcome -CloseApps 'iexplore' -AllowDefer -DeferTimes 3 -CheckDiskSpace -PersistPrompt

        ## Show Progress Message (with the default message)
        Show-InstallationProgress

        ## <Perform Pre-Installation tasks here>


        ##*===============================================
        ##* MARK: INSTALLATION
        ##*===============================================
        [String]$installPhase = 'Installation'

        ## <Perform Installation tasks here>


        ##*===============================================
        ##* MARK: POST-INSTALLATION
        ##*===============================================

        
    }
    ElseIf ($deploymentType -ieq 'Uninstall') {
        ##*===============================================
        ##* MARK: PRE-UNINSTALLATION
        ##*===============================================
        [String]$installPhase = 'Pre-Uninstallation'

        ## Show Welcome Message, close Internet Explorer with a 60 second countdown before automatically closing
        Show-InstallationWelcome -CloseApps 'iexplore' -CloseAppsCountdown 60

        ## Show Progress Message (with the default message)
        Show-InstallationProgress

        ## <Perform Pre-Uninstallation tasks here>


        ##*===============================================
        ##* MARK: UNINSTALLATION
        ##*===============================================
        [String]$installPhase = 'Uninstallation'

        ## <Perform Uninstallation tasks here>


        ##*===============================================
        ##* MARK: POST-UNINSTALLATION
        ##*===============================================
        [String]$installPhase = 'Post-Uninstallation'

        ## <Perform Post-Uninstallation tasks here>


    }
    ElseIf ($deploymentType -ieq 'Repair') {
        ##*===============================================
        ##* MARK: PRE-REPAIR
        ##*===============================================
        [String]$installPhase = 'Pre-Repair'

        ## Show Welcome Message, close Internet Explorer with a 60 second countdown before automatically closing
        Show-InstallationWelcome -CloseApps 'iexplore' -CloseAppsCountdown 60

        ## Show Progress Message (with the default message)
        Show-InstallationProgress

        ## <Perform Pre-Repair tasks here>

        ##*===============================================
        ##* MARK: REPAIR
        ##*===============================================
        [String]$installPhase = 'Repair'

        ## <Perform Repair tasks here>

        ##*===============================================
        ##* MARK: POST-REPAIR
        ##*===============================================
        [String]$installPhase = 'Post-Repair'

        ## <Perform Post-Repair tasks here>


    }

    ## Call the Exit-Script function to perform final cleanup operations
    Exit-Script -ExitCode $mainExitCode
}
Catch {
    [Int32]$mainExitCode = 60001
    [String]$mainErrorMessage = "\$(Resolve-Error)"
    Write-Log -Message $mainErrorMessage -Severity 3 -Source $deployAppScriptFriendlyName
    Show-DialogBox -Text $mainErrorMessage -Icon 'Stop'
    Exit-Script -ExitCode $mainExitCode
}
`;