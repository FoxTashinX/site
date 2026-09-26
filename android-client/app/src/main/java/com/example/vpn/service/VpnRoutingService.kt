package com.example.vpn.service

import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.util.Log
import com.example.vpn.data.AppPreferences
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class VpnRoutingService : VpnService() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var vpnInterface: ParcelFileDescriptor? = null
    private lateinit var appPreferences: AppPreferences

    override fun onCreate() {
        super.onCreate()
        appPreferences = AppPreferences(applicationContext)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        serviceScope.launch {
            setupVpn()
        }
        return START_STICKY
    }

    private suspend fun setupVpn() {
        if (vpnInterface != null) {
            vpnInterface?.close()
            vpnInterface = null
        }

        val builder = Builder()
            .setSession("VPN Routing Service")
            .addAddress("10.0.0.2", 24)
            .addDnsServer("8.8.8.8")
            .addRoute("0.0.0.0", 0)

        // Read routing preferences from DataStore
        val isIncludeMode = appPreferences.isIncludeMode.first()
        val selectedPackages = appPreferences.selectedPackages.first()

        try {
            if (isIncludeMode) {
                // Include Mode: Only route traffic from these apps through VPN
                if (selectedPackages.isNotEmpty()) {
                    for (packageName in selectedPackages) {
                        try {
                            builder.addAllowedApplication(packageName)
                        } catch (e: Exception) {
                            Log.e("VpnService", "App not found to allow: $packageName")
                        }
                    }
                } else {
                    // If include mode is on but no apps selected, we route nothing or self.
                    builder.addAllowedApplication(packageName) // At least route self
                }
            } else {
                // Exclude Mode: Route all traffic through VPN EXCEPT these apps
                for (packageName in selectedPackages) {
                    try {
                        builder.addDisallowedApplication(packageName)
                    } catch (e: Exception) {
                        Log.e("VpnService", "App not found to disallow: $packageName")
                    }
                }
                // Always bypass the VPN app itself to avoid routing loop
                try {
                    builder.addDisallowedApplication(packageName)
                } catch (e: Exception) {}
            }

            vpnInterface = builder.establish()
            Log.d("VpnService", "VPN Established. IncludeMode=$isIncludeMode, Apps=${selectedPackages.size}")

        } catch (e: Exception) {
            Log.e("VpnService", "Failed to establish VPN", e)
        }
    }

    override fun onDestroy() {
        serviceJob.cancel()
        vpnInterface?.close()
        vpnInterface = null
        super.onDestroy()
    }
}
