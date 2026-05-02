export function WalletConnect() {
    return (
        <div className="wallet-connect-container">
            {/* @ts-expect-error Reown AppKit web component */}
            <appkit-button />
        </div>
    );
}
