import { useState } from "react";
import "./bulkSettings.css";
import { APIServices } from "./generalSubPages/apiServices/apiServices";
import { ChatRules } from "./generalSubPages/chatRules/chatRules";
import { AntiCheatSettings } from "./generalSubPages/antiCheatSettings/antiCheatSettings";
import { OtherStuff } from "./generalSubPages/otherStuff/otherStuff";
import { LanguageFilter } from "./generalSubPages/languageFilter/languageFilter"

export function BulkSettings() {
    const [activeTab, setActiveTab] = useState("apiServices");
    const [prevTab, setPrevTab] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;

        setPrevTab(activeTab);
        setActiveTab(tab);
        setIsAnimating(true);

        setTimeout(() => {
            setPrevTab(null);
            setIsAnimating(false);
        }, 400); // match CSS animation duration
    };

    const renderTabContent = (tab: string) => {
        switch (tab) {
            case "apiServices":
                return <APIServices />;
            case "chatRules":
                return <ChatRules />;
            case "languageFilter":
                return <LanguageFilter />;
            case "antiCheatSettings":
                return <AntiCheatSettings />;
            case "otherStuff":
                return <OtherStuff />;
            default:
                return null;
        }
    };
    return (
        <div className="general-tab">
            <div className="general-tabs-sidebar">
                <button
                    className={activeTab === "apiServices" ? "tab-active" : ""}
                    onClick={() => handleTabChange("apiServices")}
                >
                    API Services
                </button>
                <button
                    className={activeTab === "chatRules" ? "tab-active" : ""}
                    onClick={() => handleTabChange("chatRules")}
                >
                    Chat Rules
                </button>
                <button className={activeTab === "languageFilter" ? "tab-active" : ""}
                    onClick={() => handleTabChange("languageFilter")}>
                    Language Filter

                </button>
                <button
                    className={activeTab === "antiCheatSettings" ? "tab-active" : ""}
                    onClick={() => handleTabChange("antiCheatSettings")}
                >
                    Anti-Cheat Settings
                </button>
                <button
                    className={activeTab === "otherStuff" ? "tab-active" : ""}
                    onClick={() => handleTabChange("otherStuff")}
                >
                    Other Stuff
                </button>
            </div>

            <div className="general-tabs-content">
                {isAnimating && prevTab && (
                    <div className="tab-wrapper tab-exit">
                        {renderTabContent(prevTab)}
                    </div>
                )}
                <div className={`tab-wrapper ${isAnimating ? "tab-enter animating" : ""}`}>
                    {renderTabContent(activeTab)}
                </div>
            </div>
        </div>
    );
}