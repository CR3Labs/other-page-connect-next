using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using TMPro;

public class Web3Controller : MonoBehaviour
{
    public TextMeshProUGUI walletAddressText;

    void Start()
    {
        
    }
    
    public void WalletChanged(string walletAddress)
    {
        Debug.Log("Wallet connected: " + walletAddress);

        if (walletAddressText != null)
        {
            walletAddressText.text = walletAddress;
        }
    }

    public void SiweAuthChange(string userId)
    {
        Debug.Log("Auth state: " + userId);
    }

    public void SiwopChange(string userId)
    {
        Debug.Log("Auth state: " + userId);
    }

    public void NetworkChange(string chainId)
    {
        Debug.Log("Network: " + chainId);
    }

    public void PaymentStatusChange(string paymentId, string status)
    {
        Debug.Log("Payment: " + paymentId + " status: " + status);
    }

    void Update()
    {
        
    }
}
